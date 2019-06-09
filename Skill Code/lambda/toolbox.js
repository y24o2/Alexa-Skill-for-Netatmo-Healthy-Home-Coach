var https = require('https');

const httpGet = (access_token) => {
    return new Promise(((resolve, reject) => {
        var options = {
            host: 'api.netatmo.com',
            port: 443,
            path: '/api/gethomecoachsdata?access_token='+access_token,
            method: 'GET',
        };
        
        const request = https.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';
            
            response.on('data', (chunk) => {
                returnData += chunk;
            });
            
            response.on('end', () => {
                resolve(JSON.parse(returnData));
            });
            
            response.on('error', (error) => {
                reject(error);
            });
        });
        request.end();
    }));
}

const timeLeft = (seconds) => {
    if (seconds <= 60){
        return seconds + " Sekunden";
    }
    else if (seconds <= 3600){
        return Math.floor(seconds/60) + " Minuten";
    }
    else if (seconds <= 3600 * 24){
        return Math.floor(seconds/(3600*24)) + " Stunden";
    }
    else{
        return "mehr als 1 Tag";
    }
};

const deviceLookup = (devices, name) => {
    var id = -1;
    var cnt = 0;
    devices.forEach((it) => {
        if (it.station_name.toLowerCase() === name.toLowerCase()){
            id = cnt;
        }
        cnt++;
    });
    return id;
};

const buildIntentHandler = (intent, callback) => {
    let speechText = "";
    let cardTitle = "";
    let cardMessage = "";
    let output = {};
    return {
        canHandle(handlerInput) {
            const request = handlerInput.requestEnvelope.request;
            return request.type === 'IntentRequest'
            && request.intent.name === intent;
        },
        async handle(handlerInput) {
            var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
            var response = await httpGet(accessToken);
            
            if (response.status === "error"){
                speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!";
                cardTitle = 'Healthy Home Coach | Fehler';
                cardMessage = speechText;
            }
            else{
                var device_num = 0;
                if(handlerInput.requestEnvelope.request.intent.slots && handlerInput.requestEnvelope.request.intent.slots.station_name && handlerInput.requestEnvelope.request.intent.slots.station_name.value){
                    device_num = deviceLookup(response.body.devices, handlerInput.requestEnvelope.request.intent.slots.station_name.value);
                    if (device_num === -1){
                        speechText = handlerInput.requestEnvelope.request.intent.slots.station_name.value + " nicht gefunden.";
                        cardMessage = speechText;
                        return handlerInput.responseBuilder
                            .speak(speechText)
                            .withSimpleCard('Healthy Home Coach | Fehler', cardMessage)
                            .getResponse();
                    }
                }
                output = callback(response, device_num);
                speechText = output.speechText;
                cardTitle = output.card.title;
                cardMessage = output.card.message;
            }
            
            return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(cardTitle, cardMessage)
            .getResponse();
        },
    };
};

module.exports = {
    "httpGet": httpGet,
    "timeLeft": timeLeft,
    "deviceLookup": deviceLookup,
    "buildIntentHandler": buildIntentHandler,
}
