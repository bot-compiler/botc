var Validator = require('jsonschema').Validator;
var v = new Validator();

var parameter = {
    "id": "/parameter",
    "type": "object",
    "properties": {
        "name": { "type": "string", "pattern": "^[A-Za-z0-9]+$" },
        "type": { "type": "string" },
        "isList": { "type": "boolean" }
    },
    "required": ["name", "type", "isList"]
}

var response = {
    "id": "/response",
    "type": "object",
    "properties": {
        "type": { "type": { "enum": ["mb", "text", "function"] } },
        "value": { "type": "string" }
    },
    "required": ["type", "value"]
}

var intent = {
    "id": "/intent",
    "type": "object",
    "properties": {
        "name": { "type": "string", "pattern": "^[A-Za-z0-9]+$"},
        "utterances": {
            "type": "array",
            "items": { "type": "string" }
        },
        "parameters": { "type": "array", "items": { "$ref": "/parameter" } },
        "response": { "$ref": "/response" },
        "required": ["name", "utterances", "parameters", "response"]
    }
}

var subIntent = {
    "id": "/subIntent",
    "type": "object",
    "properties": {
        "name": { "type": "string", "pattern": "^[A-Za-z0-9]+$" },
        "utterances": {
            "type": "array",
            "items": { "type": "string" }
        },
        "parameters": { "type": "array", "items": { "$ref": "/parameter" } }
    },
    "required": ["name", "utterances", "parameters"]
}

var entity = {
    "id": "/entity",
    "type": "object",
    "properties": {
        "name": { "type": "string", "pattern": "^[A-Za-z0-9]+$" },
        "values": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["name", "values"]
}

var tReply = {
    "id": "/tReply",
    "type": "object",
    "properties": {
        "name": { "type": "string", "pattern": "^[A-Za-z0-9]+$" },
        "reply": { "type": "string"}
    },
    "required": ["name", "reply"]
}

var tFunction = {
    "id": "/tFunction",
    "type": "object",
    "properties": {
        "name": { "type": "string", "pattern": "^[A-Za-z0-9]+$" },
        "function": { "type": "string", "pattern": "^[A-Za-z0-9]+$" }
    },
    "required": ["name", "function"]
}

var tNextState = {
    "id": "/tNextState",
    "type": "object",
    "properties": {
        "name": { "type": "string", "pattern": "^[A-Za-z0-9]+$" },
        "nextState": { "type": "string", "pattern": "^[A-Za-z0-9]+$" }
    },
    "required": ["name", "nextState"]
}

var tMb = {
    "id": "/tMb",
    "type": "object",
    "properties": {
        "name": { "type": "string", "pattern": "^[A-Za-z0-9]+$" },
        "mb": { "type": "string", "pattern": "^[A-Za-z0-9]+$" }
    },
    "required": ["name", "mb"]
}

var transition = {
    "id": "/transition",
    "type": "object",
    "oneOf": [{ "$ref": "/tReply" }, { "$ref": "/tFunction" }, { "$ref": "/tNextState" }, { "$ref": "/tMb" }]
}

var state = {
    "id": "/state",
    "type": "object",
    "properties": {
        "name": { "type": "string", "pattern": "^[A-Za-z0-9]+$" },
        "response": { "$ref": "/response" },
        "transitions": { "type": "array", "items": { "$ref": "/transition" } }
    },
    "required": ["name", "response", "transitions"]
}

var microBot = {
    "id": "/microBot",
    "type": "object",
    "properties": {
        "name": {"type": "string", "pattern": "^[A-Za-z0-9]+$"},
        "states": {"type": "array", "items": {"$ref": "/state"}}
    },
    "required": ["name", "states"]
}

var bot = {
    "id": "/bot",
    "type": "object",
    "properties": {
        "token": {"type": "string"},
        "intents": {"type": "array", "items": {"$ref": "/intent"}},
        "subIntent": {"type": "array", "items": {"$ref": "/subIntent"}},
        "entities": {"type": "array", "items": {"$ref": "/entity"}},
        "microBots": {"type": "array", "items": {"$ref": "/microBot"}},
        "about": {"type": "string"}
    },
    "required": ["intents", "token", "subIntents", "entities", "microBots"]
}

v.addSchema(parameter, '/parameter')
v.addSchema(response, '/response')
v.addSchema(intent, '/intent')
v.addSchema(entity, '/entity')
v.addSchema(tReply, '/tReply')
v.addSchema(tFunction, '/tFunction')
v.addSchema(tNextState, '/tNextState')
v.addSchema(tMb, '/tMb')
v.addSchema(transition, '/transition')
v.addSchema(state, '/state')
v.addSchema(subIntent, '/subIntent')
v.addSchema(microBot, '/microBot')

/**
 * @description Parse tree validator 
 * @param {any} JSON parsed bot.atmt.json content 
 * @returns true if parseTree is valid, throws an error otherwise
 */
function validator(parseTree)
{
    return v.validate(parseTree, bot);
}

module.exports = validator;
