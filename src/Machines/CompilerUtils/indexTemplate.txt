var express = require('express')
var bodyParser = require('body-parser')
var RootDialog = require('./Machines/RootDialog');
var bots = require('./bot')
var semaphore = require('semaphore')
var data = require('./data')

var app = express()
var semaphores = require('./conversations')
var jsonParser = bodyParser.json();

app.get('/', (req, res) => {
    res.send(JSON.stringify({
        value: 1
    }));
})

app.post('/', jsonParser, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let uuid = req.body.session.split('/');
    uuid = uuid[uuid.length - 1];
    console.log("Session id is : " + uuid);

    if (semaphores[uuid] == undefined) {
        semaphores[uuid] = semaphore(1);
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

    let intent = req.body.queryResult.intent.displayName;
    data[uuid]['intent'] = intent;
    data[uuid]['context'] = req.body;

    if (intent == 'Default Fallback Intent')
        intent = 'string'

    for (param in data[uuid]["context"].queryResult.parameters) {
        data[uuid]['store'][param] = data[uuid]["context"].queryResult.parameters[param]
    }

    semaphores[uuid].take(function() {
        bots[uuid].handle(intent);
    });
});

app.listen(3000, () => {
    console.log("Listening at 3000");
});