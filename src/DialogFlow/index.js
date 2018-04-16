entities = require('./entities.js')
intents = require('./intents.js')

// dialogFlow.entities = entities;
// dialogFlow.intents = intents;
// dialogFlow.token = 'sdfsdsfd'
// dialogFlow.intents.get()

var dialogFlow = function(devToken) {
    var obj = {}
    obj.devToken = devToken;
    obj.intents = intents(devToken);
    obj.entities = entities(devToken);

    return obj;
}

module.exports = dialogFlow;