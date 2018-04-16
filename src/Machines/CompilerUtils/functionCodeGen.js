var fs = require('fs');
var path = require('path');
let functionTemplate = fs.readFileSync(path.join(__dirname, 'functionTemplate.txt'), 'utf-8');

module.exports = {
    getFunctionCode: function(response){
        return functionTemplate.replace('#name', response['value']).replace('#name', response['value']);
    }
}