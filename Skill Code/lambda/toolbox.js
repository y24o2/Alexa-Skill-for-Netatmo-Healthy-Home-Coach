var https = require('https');
let strings = require('./strings.json')

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

const timeLeft = (seconds, locale) => {
    if (seconds <= 60){
        return stringReplace(strings[locale].time.unit_s, [{"needle": "{{count}}", "replacement": seconds}]);
    }
    else if (seconds <= 3600){
        return stringReplace(strings[locale].time.unit_m, [{"needle": "{{count}}", "replacement": Math.floor(seconds/60)}]);
    }
    else if (seconds <= 3600 * 24){
        return stringReplace(strings[locale].time.unit_h, [{"needle": "{{count}}", "replacement": Math.floor(seconds/3600)}]);
    }
    else{
        return strings[locale].time.day;
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
            if (!handlerInput.requestEnvelope.context.System.user.accessToken || handlerInput.requestEnvelope.context.System.user.accessToken.length === 0){
                speechText = strings[handlerInput.requestEnvelope.request.locale].welcome.notLinked;
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .withLinkAccountCard()
                    .getResponse();
            }
            var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
            var response = await httpGet(accessToken);
            
            if (response.status === "error"){
                speechText = strings[handlerInput.requestEnvelope.request.locale].errorIntent.speechText;
                cardTitle = strings[handlerInput.requestEnvelope.request.locale].errorIntent.card.title;
                cardMessage = speechText;
            }
            else{
                var device_num = 0;
                if(handlerInput.requestEnvelope.request.intent.slots && handlerInput.requestEnvelope.request.intent.slots.station_name && handlerInput.requestEnvelope.request.intent.slots.station_name.value){
                    device_num = deviceLookup(response.body.devices, handlerInput.requestEnvelope.request.intent.slots.station_name.value);
                    if (device_num === -1){
                        speechText = stringReplace(strings[handlerInput.requestEnvelope.request.locale].errorIntent.stationName_notFound, [{"needle": "stationName", "replacement": handlerInput.requestEnvelope.request.intent.slots.station_name.value}]);
                        cardMessage = speechText;
                        return handlerInput.responseBuilder
                            .speak(speechText)
                            .withSimpleCard(strings[handlerInput.requestEnvelope.request.locale].errorIntent.card.title, cardMessage)
                            .getResponse();
                    }
                }
                output = callback(response, device_num, handlerInput.requestEnvelope.request.locale);
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

const stringReplace = (string, replacements) => {
    let res = string;
    replacements.forEach((it) => {
        res = res.replace(it.needle, it.replacement);
    });
    return res;
};

module.exports = {
    "httpGet": httpGet,
    "timeLeft": timeLeft,
    "deviceLookup": deviceLookup,
    "buildIntentHandler": buildIntentHandler,
    "stringReplace": stringReplace
}
