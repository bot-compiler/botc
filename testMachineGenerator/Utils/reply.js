var data = require('../data')

module.exports = function(uuid, text){
    data[uuid]['res'].send(JSON.stringify({"fulfillmentText": text}))
}