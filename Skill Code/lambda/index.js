const Alexa = require('ask-sdk-core');
const tb = require('./toolbox.js');

let buildIntentHandler = tb.buildIntentHandler;
let timeLeft = tb.timeLeft;
let httpGet = tb.httpGet;
let devieLookup = tb.devieLookup;

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
            .withLinkAccountCard()
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
const GetTemperatureIntentHandler = buildIntentHandler("GetTemperatureIntent", (response, device_num) => {
    var speechText = "";
    var card = {
        "title": "'Healthy Home Coach | TestIntent'",
        "message": "",
    };
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const temperature = (response.body.devices[device_num].dashboard_data.Temperature + "").replace(".", ",");
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = temperature + " °C";
    card.message = speechText +"\ngemessen vor "+ timeLeft(time_diff);
    return {"speechText": speechText, "card": card};
});

const GetAirQualityIntentHandler = buildIntentHandler("GetAirQualityIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | CO2-Gehalt",
        "message": "",
    }
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const co2 = (response.body.devices[device_num].dashboard_data.CO2 + "");
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = co2 + " ppm";
    card.message = speechText +"\ngemessen vor "+ timeLeft(time_diff);
    return {"speechText": speechText, "card": card}
});

const GetHumidityIntentHandler = buildIntentHandler("GetHumidityIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | Luftfeuchtigkeit",
        "message": "",
    }
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const humidity = (response.body.devices[device_num].dashboard_data.Humidity + "");
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = humidity + " %";
    card.message = speechText +"\ngemessen vor "+ timeLeft(time_diff);
    return {"speechText": speechText, "card": card};
});

const GetNoiseIntentHandler = buildIntentHandler("GetNoiseIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | Lautstärke",
        "message": "",
    }
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const noise = (response.body.devices[device_num].dashboard_data.Noise + "");
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = noise + " dB";
    card.message = speechText +"\ngemessen vor "+ timeLeft(time_diff);
    return {"speechText": speechText, "card": card};
});

const GetPressureIntentHandler = buildIntentHandler("GetPressureIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | Luftdruck",
        "message": "",
    }
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const pressure = (response.body.devices[device_num].dashboard_data.Pressure + "").replace(".", ",");
    const absPressure = (response.body.devices[device_num].dashboard_data.AbsolutePressure + "").replace(".", ",");
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = pressure + " Milli-bar";
    card.message = pressure + " mbar\nabsolut " + absPressure + " mbar" +"\ngemessen vor "+ timeLeft(time_diff);
    return {"speechText": speechText, "card": card};
});

const GetHealthIndexIntentHandler = buildIntentHandler("GetHealthIndexIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | Gesundheitsindex",
        "message": "",
    }
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const health_idx = response.body.devices[device_num].dashboard_data.health_idx;
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = ["Gesund", "Gut", "Okay", "Schlecht", "Ungesund"][health_idx];
    card.message = "Index: " + health_idx + " ("+ speechText +")\ngemessen vor "+ timeLeft(time_diff);
    return {"speechText": speechText, "card": card};
});

const GetSumIntentHandler = buildIntentHandler("GetSumIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach",
        "message": "",
    }
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const data = response.body.devices[device_num].dashboard_data;
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;

    speechText = "<speak><p>Das Raumklima ist insgesamt " + ["gesund", "gut", "okay", "schlecht", "ungesund"][data.health_idx];
    speechText += "</p><p>Die Temperatur beträgt " + (data.Temperature + "").replace(".", ",") + " Grad Celsius";
    speechText += "</p><p>Die Luftfeuchtigkeit beträgt " + data.Humidity + " %";
    speechText += "</p><p>Der CO2-Gehalt beträgt " + data.CO2 + "ppm";
    speechText += "</p><p>Die Lautstärke beträgt " + data.Noise + "dB</p></speak>";

    card.message = "Klimaindex: " + data.health_idx + " ("+ ["Gesund", "Gut", "Okay", "Schlecht", "Ungesund"][data.health_idx]+")";
    card.message += "\nTemperatur: " + (data.Temperature + "").replace(".", ",") + " °C";
    card.message += "\nLuftfeuchtigkeit: " + data.Humidity + "%";
    card.message += "\nCO2-Gehalt: " + data.CO2 + " ppm";
    card.message += "\nLautstärke: " + data.Noise + " dB";
    card.message += "\ngemessen vor "+ timeLeft(time_diff);
    return {"speechText": speechText, "card": card};
});

const GetLastUpdateIntentHandler = buildIntentHandler("GetLastUpdateIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | Messzeitpunkt",
        "message": "",
    }
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = "Messung durchgeführt vor " + timeLeft(time_diff);
    card.message = speechText;
    return {"speechText": speechText, "card": card};
});

const GetDeviceLocationIntentHandler = buildIntentHandler("GetDeviceLocationIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | Standort",
        "message": "",
    }
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const place = response.body.devices[device_num].place;
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = place.city;
    card.message = speechText + "\n\tLong: "+place.location[0];
    card.message += "\n\tLang: " + place.location[1];
    return {"speechText": speechText, "card": card};
});

const GetUserEmailIntentHandler = buildIntentHandler("GetUserEmailIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | Emailaddresse",
        "message": "",
    }
    const mail = response.body.user.mail;
    speechText = mail;
    card.message = speechText;
    return {"speechText": speechText, "card": card};
});

const GetWifiStatusIntentHandler = buildIntentHandler("GetWifiStatusIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | WiFi-Status",
        "message": "",
    }
    const wifi_status = response.body.devices[device_num].wifi_status;
    speechText = wifi_status+"";
    card.message = speechText + "\n(86=schlecht, 56=gut)";
    return {"speechText": speechText, "card": card};
});

const GetDeviceListIntentHandler = buildIntentHandler("GetDeviceListIntent", (response, device_num) => {
    let speechText = "";
    let card = {
        "title": "Healthy Home Coach | DeviceList",
        "message": "",
    }
    const count = response.body.devices.length;
    const devices = response.body.devices;
    if (count >= 2){
        speechText = "<p>" + count + " Geräte sind verknüpft.</p>";
    }
    devices.forEach((it) => {
        speechText += "<p>Gerät: "+it.station_name+"</p>";
        card.message += it.station_name + " ("+it._id+")\n";
    });
    return {"speechText": speechText, "card": card};
});


// Buildin intents:
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Du kannst mich nach dem Raumklima fragen. Wie kann ich dir helfen?';
        return handlerInput.responseBuilder.speak(speechText).reprompt(speechText).getResponse();
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
        return handlerInput.responseBuilder.speak(speechText).getResponse();
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

        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Entschuldigung, das habe ich nicht verstanden. Bitte versuche es noch einmal!`;
        return handlerInput.responseBuilder.speak(speechText).reprompt(speechText).getResponse();
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
