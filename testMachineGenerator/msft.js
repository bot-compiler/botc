var builder = require('botbuilder');
var axios = require('axios');
var RootDialog = require('./Machines/RootDialog');
var bots = require('./bot')
var semaphore = require('semaphore')
var data = require('./data')
var semaphores = require('./conversations')
var express = require('express');

var server = express();

var connector = new builder.ChatConnector({
    appId: "", //MicrosoftAppId
    appPassword: "" //MicrosoftAppPassword
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, async function(session) {
    let response = await callDialogFlow(session.message.text, session.message.user.id);
    if (response.data.result.actionIncomplete)
        session.send(response.data.result.fulfillment.speech);
    else
        handleBot(response.data, session);
}).set('storage', new builder.MemoryBotStorage());

async function callDialogFlow(query, sessionId) {
    let clientId = '<YOUR DIALOGFLOW CLIENT ID HERE>'
    const response = await axios.get('https://api.dialogflow.com/v1/query?v=20150910&lang=en&sessionId=' + sessionId + '&query=' + query, {
        'headers': {
            'Authorization': 'Bearer ' + clientId
        }
    });
    return response;
}

function handleBot(dfResponse, session) {
    let uuid = session.message.user.id;

    if (semaphores[uuid] == undefined) {
        semaphores[uuid] = semaphore(1);
    }

    let res = {
        send: function(data) {
            session.send(JSON.parse(data)['speech']);
        }
    }

    res.semaphore = semaphores[uuid];
    res.uuid = uuid;

    if (bots[uuid] == undefined) {
        bots[uuid] = new RootDialog({
            uuid: uuid
        });
        data[uuid] = {
            'store': {},
            'microBots': {},
            'expectedIntents': {}
        }
    }

    data[uuid]['res'] = res;

    let intent = dfResponse.result.metadata.intentName;
    data[uuid]['intent'] = intent;
    data[uuid]['context'] = dfResponse;

    if (intent == 'Default Fallback Intent')
        intent = 'string'

    for (param in data[uuid]["context"].result.parameters) {
        data[uuid]['store'][param] = data[uuid]["context"].result.parameters[param]
    }

    semaphores[uuid].take(function() {
        bots[uuid].handle(intent);
    });
}

server.listen(process.env.PORT || process.env.port || 3978, () => {
    console.log('BOT listening .....');
})