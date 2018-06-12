var _ = require('underscore');
var request = require('request');
var async = require('async');
var _ = require('underscore');
var axios = require('axios');

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
        var toCreate = {};

        try {
            var intentsInDialogflow = await axios({
                method: 'get',
                url: 'https://api.dialogflow.com/v1/intents?v=20150910',
                headers: {
                    authorization: 'Bearer ' + devToken
                }
            });
            let keys = Object.keys(ints);
            keys.map((intentInTree) => {
                if(_.findWhere(intentsInDialogflow.data, { 'name': intentInTree }) != undefined)
                {
                    delete ints[intentInTree];
                };
            });
        } catch (error) {
            callback(error, null);
            return;
        }
        
    
        for(key in ints) {
            var templates = getTemplates(ints[key].utterances, ints[key].parameters); 
            var body = {};
            addParameters(body, ints[key].parameters);
            body.name = key;
            body.templates = templates;
            body.webhookUsed = true;
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
                return callback("Failed to create all the intents/sub intents");
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
                return callback('error in getting intent', null)
            }
            callback(null, response)
        })        
    }

    obj.prepare = function() {
        var callback = arguments[arguments.length - 1]
        // id is present
        if(!arguments[1]) {
            this.get(function(error, intents) {
                if(error || !intents)
                    return callback(error, null);
                defIntent = _.findWhere(intents, { 'fallbackIntent': true, 
                    'name': 'Default Fallback Intent' });
                welIntent = _.findWhere(intents, { 'fallbackIntent': true, 
                    'name': 'Default Welcome Intent' });
                if(defIntent != undefined)
                    apiCall(defIntent);
                else {
                    let optns = {
                        method: 'POST',
                        url: 'https://api.dialogflow.com/v1/intents',
                        qs: { v: '20150910' },
                        headers:
                            {
                                'content-type': 'application/json',
                                authorization: 'Bearer ' + devToken
                            },
                        body:
                            {
                                events: [],
                                fallbackIntent: true,
                                name: 'Default Fallback Intent',
                                responses: [],
                                templates: [],
                                userSays: [],
                                webhookForSlotFilling: false,
                                webhookUsed: true
                            },
                        json: true
                    };

                    request(optns, function (error, response, body) {
                        if (error) 
                            console.log('Error while creating Default fallback intent');
                        else
                            console.log('Created default fallback intent');
                    });
                }
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

        function deleteIntent(intent) {
            var options = {
                headers: {
                    'Authorization': 'Bearer ' + self.devToken,
                    'Content-Type': 'application/json'
                },
                'uri': URI + '/' + intent.id,
                'method': 'DELETE',
                'json': true
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