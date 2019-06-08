// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
var https = require('https');

// Hilfs-Funktionen:
//      httpGet     Ruft die aktuellen Werte aus der API ab
//      timeLeft    Berechnet die vergangene Zeit

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

// LaunchRequestHandler
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        var tokenMsg = ""
        if (!handlerInput.requestEnvelope.context.System.user.accessToken || handlerInput.requestEnvelope.context.System.user.accessToken.length === 0){
            tokenMsg = " Bitte verbinde diesen Skill mit deinem Netatmo-Account!";
        }
        const speechText = "Willkommen, in meinem Skill Healthy Home Coach." + tokenMsg;
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};

// Intent Handler
//      Ausführen der angeforderten Funktion
//      GetTemperatureIntent    Thermometer
//      GetAirQualityIntent     CO2-Gehalt
//      GetHumidityIntent       Luftfeuchtigkeit
//      GetNoiseIntent          Lautstärke
//      GetPressureIntent       Luftdruck
//      GetHealthIndexIntent    HealthIndex     0 = Healthy, 1 = Fine, 2 = Fair, 3 = Poor, 4 = Unhealthy
//      GetSumIntent            Alle Werte
//      GetLastUpdateIntent     Aktualität

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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
            const temperature = (response.body.devices[0].dashboard_data.Temperature + "").replace(".", ",");
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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
            const co2 = (response.body.devices[0].dashboard_data.CO2 + "");
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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
            const humidity = (response.body.devices[0].dashboard_data.Humidity + "");
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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
            const noise = (response.body.devices[0].dashboard_data.Noise + "");
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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
            const pressure = (response.body.devices[0].dashboard_data.Pressure + "").replace(".", ",");
            const absPressure = (response.body.devices[0].dashboard_data.AbsolutePressure + "").replace(".", ",");
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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
            const health_idx = response.body.devices[0].dashboard_data.health_idx;
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
    canHandle(handlerInput) {
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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
            const data = response.body.devices[0].dashboard_data;
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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
            const place = response.body.devices[0].place;
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
            const time_utc = response.body.devices[0].dashboard_data.time_utc;
            const mail = response.body.user.mail;
            let time_diff = Math.floor(Date.now() / 1000) - time_utc;
            speechText = mail;
            cardMessage = speechText;
        }
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard('Healthy Home Coach | Emailaddresse', cardMessage)
        .getResponse();
    },
};

// Buildin intents:
//      Alexa Default Intents

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

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
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

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
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

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
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
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
