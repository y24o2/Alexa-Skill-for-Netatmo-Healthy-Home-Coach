const Alexa = require('ask-sdk-core');
const tb = require('./toolbox.js');
const strings = require('./strings.json');

let buildIntentHandler = tb.buildIntentHandler;
let timeLeft = tb.timeLeft;
let httpGet = tb.httpGet;
let deviceLookup = tb.deviceLookup;
let stringReplace = tb.stringReplace;

// LaunchRequestHandler
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const msg = strings[handlerInput.requestEnvelope.request.locale];
        var speechText = "";
        if (!handlerInput.requestEnvelope.context.System.user.accessToken || handlerInput.requestEnvelope.context.System.user.accessToken.length === 0){
            speechText = msg.welcome.notLinked;
        return handlerInput.responseBuilder
            .speak(speechText)
            .withLinkAccountCard()
            .getResponse();
        }
        speechText = msg.welcome.linked;
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(msg.welcome.reprompt)
            .getResponse();
    }
};

// Intent Handler
const GetTemperatureIntentHandler = buildIntentHandler("GetTemperatureIntent", (response, device_num, locale) => {
    var speechText = "";
    var card = {
        "title": strings[locale].temperatureIntent.card.title,
        "message": "",
    };
    const station_name = response.body.devices[device_num].station_name;
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    let temperature = (response.body.devices[device_num].dashboard_data.Temperature + "");
    if(locale === "de-DE") temperature = temperature.replace(".", ",");
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = stringReplace(strings[locale].temperatureIntent.speechText, [{
        "needle": "{{value}}", "replacement": temperature}, {"needle": "{{stationName}}", "replacement": station_name}]);
    card.message = stringReplace(strings[locale].temperatureIntent.card.message,
        [{"needle": "{{value}}", "replacement": temperature}, {"needle": "{{stationName}}", "replacement": station_name}, {"needle": "{{timeLeft}}", "replacement": timeLeft(time_diff, locale)}]);
    return {"speechText": speechText, "card": card};
});

const GetAirQualityIntentHandler = buildIntentHandler("GetAirQualityIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].airQualityIntent.card.title,
        "message": "",
    }
    const station_name = response.body.devices[device_num].station_name;
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const co2 = (response.body.devices[device_num].dashboard_data.CO2 + "");
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = stringReplace(strings[locale].airQualityIntent.speechText, [{"needle": "{{value}}", "replacement": co2}, {"needle": "{{stationName}}", "replacement": station_name}]);
    card.message = stringReplace(strings[locale].airQualityIntent.card.message,
        [{"needle": "{{value}}", "replacement": co2}, {"needle": "{{stationName}}", "replacement": station_name}, {"needle": "{{timeLeft}}", "replacement": timeLeft(time_diff, locale)}]);
    return {"speechText": speechText, "card": card}
});

const GetHumidityIntentHandler = buildIntentHandler("GetHumidityIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].humidityIntent.card.title,
        "message": "",
    }
    const station_name = response.body.devices[device_num].station_name;
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const humidity = (response.body.devices[device_num].dashboard_data.Humidity + "");
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = stringReplace(strings[locale].humidityIntent.speechText, [{"needle": "{{value}}", "replacement": humidity}, {"needle": "{{stationName}}", "replacement": station_name}]);
    card.message = stringReplace(strings[locale].humidityIntent.card.message,
        [{"needle": "{{value}}", "replacement": humidity}, {"needle": "{{stationName}}", "replacement": station_name}, {"needle": "{{timeLeft}}", "replacement": timeLeft(time_diff, locale)}]);
    return {"speechText": speechText, "card": card};
});

const GetNoiseIntentHandler = buildIntentHandler("GetNoiseIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].noiseLevelIntent.card.title,
        "message": "",
    }
    const station_name = response.body.devices[device_num].station_name;
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const noise = (response.body.devices[device_num].dashboard_data.Noise + "");
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = stringReplace(strings[locale].noiseLevelIntent.speechText, [{"needle": "{{value}}", "replacement": noise}, {"needle": "{{stationName}}", "replacement": station_name}]);
    card.message = stringReplace(strings[locale].noiseLevelIntent.card.message,
        [{"needle": "{{value}}", "replacement": noise}, {"needle": "{{stationName}}", "replacement": station_name}, {"needle": "{{timeLeft}}", "replacement": timeLeft(time_diff, locale)}]);
    return {"speechText": speechText, "card": card};
});

const GetPressureIntentHandler = buildIntentHandler("GetPressureIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].airPressureIntent.card.title,
        "message": "",
    }
    const station_name = response.body.devices[device_num].station_name;
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    let pressure = (response.body.devices[device_num].dashboard_data.Pressure + "");
    let absPressure = (response.body.devices[device_num].dashboard_data.AbsolutePressure + "");
    if(locale === "de-DE"){
        pressure = pressure.replace(".", ",");
        absPressure = absPressure.replace(".", ",");
    }
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = stringReplace(strings[locale].airPressureIntent.speechText, [{"needle": "{{value}}", "replacement": pressure}, {"needle": "{{stationName}}", "replacement": station_name}]);
    card.message = 
        stringReplace(strings[locale].airPressureIntent.card.message, [
            {"needle": "{{air_pressure}}", "replacement": pressure},
            {"needle": "{{abs_air_pressure}}", "replacement": absPressure},
            {"needle": "{{stationName}}", "replacement": station_name},
            {"needle": "{{timeLeft}}", "replacement": timeLeft(time_diff, locale)}]);
    return {"speechText": speechText, "card": card};
});

const GetHealthIndexIntentHandler = buildIntentHandler("GetHealthIndexIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].healthIndexIntent.card.title,
        "message": "",
    }
    const station_name = response.body.devices[device_num].station_name;
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const health_idx = response.body.devices[device_num].dashboard_data.health_idx;
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    let value = strings[locale].healthIndex[health_idx];
    speechText = stringReplace(strings[locale].healthIndexIntent.speechText, [{"needle": "{{value}}", "replacement": value}, {"needle": "{{stationName}}", "replacement": station_name}]);
    card.message =
        stringReplace(strings[locale].healthIndexIntent.card.message, [
            {"needle": "{{value}}", "replacement": health_idx},
            {"needle": "{{spoken_index}}", "replacement": value},
            {"needle": "{{stationName}}", "replacement": station_name},
            {"needle": "{{timeLeft}}", "replacement": timeLeft(time_diff, locale)}]);
    return {"speechText": speechText, "card": card};
});

const GetSumIntentHandler = buildIntentHandler("GetSumIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].sumIntent.card.title,
        "message": "",
    }
    const station_name = response.body.devices[device_num].station_name;
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    let data = response.body.devices[device_num].dashboard_data;
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    
    speechText = stringReplace(
        strings[locale].sumIntent.speechText,
        [{"needle": "{{index}}", "replacement": strings[locale].healthIndex[data.health_idx]},
        {"needle": "{{temperature}}", "replacement": (locale === "de-DE") ? (data.Temperature+"").replace(".", ",") : data.Temperature},
        {"needle": "{{humidity}}", "replacement": data.Humidity},
        {"needle": "{{pressure}}", "replacement": (locale === "de-DE") ? (data.Pressure+"").replace(".", ",") : data.Pressure},
        {"needle": "{{co2}}", "replacement": data.CO2},
        {"needle": "{{noise_level}}", "replacement": data.Noise},
        {"needle": "{{stationName}}", "replacement": station_name}]);
    
    card.message = stringReplace(strings[locale].sumIntent.card.message,
        [{"needle": "{{index}}", "replacement": data.health_idx},
        {"needle": "{{spoken_index}}", "replacement": strings[locale].healthIndex[data.health_idx]},
        {"needle": "{{temperature}}", "replacement": (locale === "de-DE") ? (data.Temperature+"").replace(".", ",") : data.Temperature},
        {"needle": "{{humidity}}", "replacement": data.Humidity},
        {"needle": "{{pressure}}", "replacement": (locale === "de-DE") ? (data.Pressure+"").replace(".", ",") : data.Pressure},
        {"needle": "{{co2}}", "replacement": data.CO2},
        {"needle": "{{noise_level}}", "replacement": data.Noise},
        {"needle": "{{stationName}}", "replacement": station_name},
        {"needle": "{{timeLeft}}", "replacement": timeLeft(time_diff, locale)}]);
        
    return {"speechText": speechText, "card": card};
});

const GetLastUpdateIntentHandler = buildIntentHandler("GetLastUpdateIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].timeIntent.card.title,
        "message": "",
    }
    const station_name = response.body.devices[device_num].station_name;
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = stringReplace(strings[locale].timeIntent.speechText, [{"needle": "{{stationName}}", "replacement": station_name},
        {"needle": "{{value}}", "replacement": timeLeft(time_diff, locale)}]);
    card.message = stringReplace(strings[locale].timeIntent.card.message, [{"needle": "{{stationName}}", "replacement": station_name},
        {"needle": "{{value}}", "replacement": timeLeft(time_diff, locale)}]);
    return {"speechText": speechText, "card": card};
});

const GetDeviceLocationIntentHandler = buildIntentHandler("GetDeviceLocationIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].locationIntent.card.title,
        "message": "",
    }
    const station_name = response.body.devices[device_num].station_name;
    const time_utc = response.body.devices[device_num].dashboard_data.time_utc;
    const place = response.body.devices[device_num].place;
    let time_diff = Math.floor(Date.now() / 1000) - time_utc;
    speechText = stringReplace(strings[locale].locationIntent.speechText, [{"needle": "{{city}}", "replacement": place.city}, {"needle": "{{stationName}}", "replacement": station_name}]);
    card.message = stringReplace(strings[locale].locationIntent.card.message,
        [{"needle": "{{city}}", "replacement": place.city},
        {"needle": "{{lat}}", "replacement": place.location[0]},
        {"needle": "{{long}}", "replacement": place.location[1]}]);
    return {"speechText": speechText, "card": card};
});

const GetUserEmailIntentHandler = buildIntentHandler("GetUserEmailIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].mailIntent.card.title,
        "message": "",
    }
    const mail = response.body.user.mail;
    speechText = stringReplace(strings[locale].mailIntent.speechText, [{"needle": "{{mail}}", "replacement": mail}]);
    card.message = stringReplace(strings[locale].mailIntent.card.message, [{"needle": "{{mail}}", "replacement": mail}]);
    return {"speechText": speechText, "card": card};
});

const GetWifiStatusIntentHandler = buildIntentHandler("GetWifiStatusIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].wifiSignalIntent.card.title,
        "message": "",
    }
    const station_name = response.body.devices[device_num].station_name;
    const wifi_status = response.body.devices[device_num].wifi_status;
    speechText = wifi_status+"";
    card.message = stringReplace(strings[locale].wifiSignalIntent.card.message, [{"needle": "{{value}}", "replacement": wifi_status}]);
    return {"speechText": speechText, "card": card};
});

const GetDeviceListIntentHandler = buildIntentHandler("GetDeviceListIntent", (response, device_num, locale) => {
    let speechText = "";
    let card = {
        "title": strings[locale].deviceListIntent.card.title,
        "message": "",
    }
    const count = response.body.devices.length;
    const devices = response.body.devices;
    if (count >= 2){
        speechText = stringReplace(strings[locale].deviceListIntent.speechText, [{"needle": "{{count}}", "replacement": count}]);
    }
    devices.forEach((it) => {
        speechText += stringReplace(strings[locale].deviceListIntent.stationName, [{"needle": "{{stationName}}", "replacement": it.station_name}]);
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
        const speechText = strings[handlerInput.requestEnvelope.request.locale].helpIntent;
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
        const speechText = strings[handlerInput.requestEnvelope.request.locale].stopIntent;
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
         const speechText = strings[handlerInput.requestEnvelope.request.locale].unhandledIntent;

        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = strings[handlerInput.requestEnvelope.request.locale].errorHandler;
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
