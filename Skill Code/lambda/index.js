const Alexa = require('ask-sdk-core');
var https = require('https');

// Hilfs-Funktionen:
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

// LaunchRequestHandler
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        var speechText = "";
        if (!handlerInput.requestEnvelope.context.System.user.accessToken || handlerInput.requestEnvelope.context.System.user.accessToken.length === 0){
            speechText = "Willkommen, im Skill Healthy Home Coach. Bitte verbinde diesen Skill mit deinem Netatmo-Account!"
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
        }
        speechText = "Willkommen, im Skill Healthy Home Coach. Was kann ich für dich tun?";
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt("Welche Funktion möchtest du starten?")
            .getResponse();
    }
};

// Intent Handler
const GetTemperatureIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetTemperatureIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            const temperature = (response.body.devices[device_num].dashboard_data.Temperature + "").replace(".", ",");
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = temperature + " °C";
            cardMessage = speechText +"\ngemessen vor "+ timeLeft(time_diff);
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | Raum-Temperatur', cardMessage)
        .getResponse();
    },
};

const GetAirQualityIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetAirQualityIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            const co2 = (response.body.devices[device_num].dashboard_data.CO2 + "");
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = co2 + " ppm";
            cardMessage = speechText +"\ngemessen vor "+ timeLeft(time_diff);
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | CO2-Gehalt', cardMessage)
        .getResponse();
    },
};

const GetHumidityIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetHumidityIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            const humidity = (response.body.devices[device_num].dashboard_data.Humidity + "");
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = humidity + " %";
            cardMessage = speechText +"\ngemessen vor "+ timeLeft(time_diff);
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | Luftfeuchtigkeit', cardMessage)
        .getResponse();
    },
};

const GetNoiseIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetNoiseIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            const noise = (response.body.devices[device_num].dashboard_data.Noise + "");
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = noise + " dB";
            cardMessage = speechText +"\ngemessen vor "+ timeLeft(time_diff);
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | Lautstärke', cardMessage)
        .getResponse();
    },
};

const GetPressureIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetPressureIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            const pressure = (response.body.devices[device_num].dashboard_data.Pressure + "").replace(".", ",");
            const absPressure = (response.body.devices[device_num].dashboard_data.AbsolutePressure + "").replace(".", ",");
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = pressure + " Hektopascal und absolut " + absPressure + " Hektopascal";
            cardMessage = pressure + " hPa, absolute " + absPressure + " hPa" +"\ngemessen vor "+ timeLeft(time_diff);
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | Luftdruck', cardMessage)
        .getResponse();
    },
};

const GetHealthIndexIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetHealthIndexIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            const health_idx = response.body.devices[device_num].dashboard_data.health_idx;
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = ["Gesund", "Gut", "Okay", "Schlecht", "Ungesund"][health_idx];
            cardMessage = "Index: " + health_idx + " ("+ speechText +")\ngemessen vor "+ timeLeft(time_diff);
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | Gesundheitsindex', cardMessage)
        .getResponse();
    },
};

const GetSumIntentHandler = {
    canHandle   (handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetSumIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            const data = response.body.devices[device_num].dashboard_data;
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            
            speechText = "<speak><p>Das Raumklima ist insgesamt " + ["gesund", "gut", "okay", "schlecht", "ungesund"][data.health_idx];
            speechText += "</p><p>Die Temperatur beträgt " + (data.Temperature + "").replace(".", ",") + " Grad Celsius";
            speechText += "</p><p>Die Luftfeuchtigkeit beträgt " + data.Humidity + " %";
            speechText += "</p><p>Der CO2-Gehalt beträgt " + data.CO2 + "ppm";
            speechText += "</p><p>Die Lautstärke beträgt " + data.Noise + "dB</p></speak>";
            
            cardMessage = "Klimaindex: " + data.health_idx + " ("+ ["Gesund", "Gut", "Okay", "Schlecht", "Ungesund"][data.health_idx]+")";
            cardMessage += "\nTemperatur: " + (data.Temperature + "").replace(".", ",") + " °C";
            cardMessage += "\nLuftfeuchtigkeit: " + data.Humidity + "%";
            cardMessage += "\nCO2-Gehalt: " + data.CO2 + " ppm";
            cardMessage += "\nLautstärke: " + data.Noise + " dB";
            cardMessage += "\ngemessen vor "+ timeLeft(time_diff);
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach', cardMessage)
        .getResponse();
    },
};

const GetLastUpdateIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetLastUpdateIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = "Messung durchgeführt vor " + timeLeft(time_diff);
            cardMessage = speechText;
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | Messzeitpunkt', cardMessage)
        .getResponse();
    },
};

const GetDeviceLocationIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetDeviceLocationIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            const place = response.body.devices[device_num].place;
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = place.city;
            cardMessage = speechText + "\n\tLong: "+place.location[0];
            cardMessage += "\n\tLang: " + place.location[1];
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | Standort', cardMessage)
        .getResponse();
    },
};


const GetUserEmailIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetUserEmailIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            const mail = response.body.user.mail;
            speechText = mail;
            cardMessage = speechText;
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | Emailaddresse', cardMessage)
        .getResponse();
    },
};

const GetWifiStatusIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetWifiStatusIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            var device_num = 0;
            if(handlerInput.requestEnvelope.request.intent.slots.station_name.value){
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
            const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
            const wifi_status = response.body.devices[device_num].wifi_status;
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = wifi_status+"";
            cardMessage = speechText + "\n(86=schlecht, 56=gut)";
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | WiFi-Status', cardMessage)
        .getResponse();
    },
};

const GetDeviceListIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
        && request.intent.name === 'GetDeviceListIntent';
    },
    async handle(handlerInput) {
        
        let speechText = "";
        let cardMessage = "";
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        var response = await httpGet(accessToken);
        
        if (response.status === "error"){
            speechText = "Ups, da ist etwas schiefgegangen. Bitte probiere es später noch einmal!"
            cardMessage = speechText
        }
        else{
            const count = response.body.devices.length;
            const devices = response.body.devices;
            if (count >= 2){
                speechText = "<p>" + count + " Geräte sind verknüpft.</p>";
            }
            devices.forEach((it) => {
                speechText += "<p>Gerät: "+it.station_name+"</p>";
                cardMessage += it.station_name + " ("+it._id+")\n";
            });
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | DeviceList', cardMessage)
        .getResponse();
    },
};

// Buildin intents:
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Du kannst mich nach dem Raumklima fragen. Wie kann ich dir helfen?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'bis bald!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        
         // const speechText = `You just triggered ${intentName}`;
         const speechText = "<speak><audio src='soundbank://soundlibrary/musical/amzn_sfx_electronic_beep_02'/></speak>"

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Entschuldigung, das habe ich nicht verstanden. Bitte versuche es noch einmal!`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// SkillBuilder
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        GetTemperatureIntentHandler,
        GetAirQualityIntentHandler,
        GetHumidityIntentHandler,
        GetNoiseIntentHandler,
        GetPressureIntentHandler,
        GetHealthIndexIntentHandler,
        GetSumIntentHandler,
        GetLastUpdateIntentHandler,
        GetDeviceLocationIntentHandler,
        GetUserEmailIntentHandler,
        GetWifiStatusIntentHandler,
        GetDeviceListIntentHandler,
        IntentReflectorHandler) // this is the last RequestHandlers in this list
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
