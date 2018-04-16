var _ = require('underscore');
var request = require('request');
var async = require('async');
var _ = require('underscore');

var intents = {};
var URI = 'https://api.dialogflow.com/v1/intents';

function getTemplates(utterances, parameters) {
    for(var i in utterances) {
        for(var j in parameters) {
            utterances[i] = utterances[i].replace(new RegExp(parameters[j].type, 'g'), parameters[j].type + ':' + parameters[j].name);
        }
    }
    return utterances
}

function sendRequest(options, callback) {
    request(options, function(error, response) {
        if (error) 
            return callback(error, null);
        callback(null, response.body);
    })
}

function addParameters(body, parameters)
{
    body['responses'] = []
    let defaultAction = {"action": "default", "parameters": []}
    parameters.map((parameter) => {
        defaultAction['parameters'].push({"dataType": parameter['type'], "isList": parameter['isList'], "required": true, "value": '$'+parameter['name'], "name": parameter['name']})
    })
    body['responses'].push(defaultAction);
}

intents = function(devToken) {
    var obj = {}
    obj.devToken = devToken;
    obj.create = function(syntaxTree, callback) {

        var ints = syntaxTree.intents;
    
        // var threshold = Object.keys(ints).length;
        // var count = 0;
    
        var optionsArr = [];
    
        for(key in ints) {
            var templates = getTemplates(ints[key].utterances, ints[key].parameters); 
            var body = {};
            addParameters(body, ints[key].parameters);
            body.name = key;
            body.templates = templates;
            body.auto = true;
            var options = {
                headers: {
                    'Authorization': 'Bearer ' + this.devToken,
                    'Content-Type': 'application/json'
                },
                'uri': URI,
                'method': 'POST',
                'json': true,
                'body': body
            };
            
            optionsArr.push(options);
        }
        async.map(optionsArr, sendRequest, function(error, results) {
            if(error) {
                console.log("ERRORR!!!");
                return callback("Fail");
            }
            callback(null, results.status);        
        })
    }
    obj.get = function() {
        var reqURI = URI
        callback = arguments[arguments.length - 1]
        // id
        if(arguments[1]) {
            reqURI = URI + '/' + arguments[0]
        }
        var options = {
            headers: {
                'Authorization': 'Bearer ' + this.devToken,
                'Content-Type': 'application/json'
            },
            'uri': reqURI,
            'method': 'GET',
            'json': true
        };

        sendRequest(options, function(error, response) {
            if(error) {
                console.log('error in getting intent ' + id);
                return callback('error in getting intent ' + id, null)
            }
            callback(null, response)
        })        
    }

    obj.useWebHook = function() {
        var callback = arguments[arguments.length - 1]
        // id is present
        if(!arguments[1]) {
            this.get(function(error, intents) {
                if(error || !intents)
                    return callback(error, null);
                defIntent = _.findWhere(intents, { 'fallbackIntent': true, 
                    'name': 'Default Fallback Intent' });
                console.log(defIntent);
                apiCall(defIntent);
            });
        } else {
            this.get(arguments[0], function(error, intent) {
                if(error || !intent)
                    return callbackify(error, null);
                defIntent = intent
                apiCapp(defIntent);
            })
        }
        var self = this;
        function apiCall(defIntent) {
            defIntent.webhookUsed = true;
            var options = {
                headers: {
                    'Authorization': 'Bearer ' + self.devToken,
                    'Content-Type': 'application/json'
                },
                'uri': URI + '/' + defIntent.id,
                'method': 'PUT',
                'json': true,
                'body': defIntent
            };
            sendRequest(options, function(error, response) {
                if(error)
                    return callback(error, null);
                callback(null, response);
            })
        }
    }

    return obj;
}

module.exports = intents