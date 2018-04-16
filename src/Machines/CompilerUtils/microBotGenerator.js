var beautify = require('js-beautify').js_beautify;
var fs = require('fs');
var path = require('path')
let stateTemplate = fs.readFileSync(path.join(__dirname, 'mbStateTemplate.txt'), 'utf-8')
let dialogTemplate = fs.readFileSync(path.join(__dirname, 'mbotDialogTemplate.txt'), 'utf-8')
var databaseCodeGen = require('./dataBaseCodeGen')
var functionCodeGen = require('./functionCodeGen')
let updateTemplate = fs.readFileSync(path.join(__dirname, 'mbUpdateCode.txt'), 'utf-8')

function generator(microBots, functions)
{
    let dialogs = {}
    for(bot in microBots)
    {
        let botStates = microBots[bot]
        let states = []
        let newDialog = dialogTemplate;
        functions[bot] = []
        for(state in botStates)
        {
            let newState = stateTemplate.replace('#stateName', state + "State");
            // add option for response as template
            let code;
            let response = botStates[state]['response'];
            let transitionCode = undefined;

            if(response['type'] == 'text')
                code = 'replier(this.uuid, "' + response['value'] + '");\nconversations.done(this.uuid);'
            
            else if(response['type'] == 'mb')
            {
                let botName = response['value'] + 'Bot';
                code = 'bots[this.uuid] = new ' + botName + '({uuid: this.uuid, parent: this, rootIntent: this.rootIntent})';
                newDialog = newDialog.replace('//require', 'var ' + botName + '= require("./' + botName + '");\n//require');
            }

            else if(response['type'] == 'function')
            {
                functions[bot].push(response['value']);
                code = functionCodeGen.getFunctionCode(response);
            }

            else
            {
                // This is a databse operation, pass response to databseCodeGen to get code for that.
                if(response['type'] == 'get')
                {
                    code = databaseCodeGen.getRetrieveCode(response); 
                }

                else if(response['type'] == 'store')
                {
                    code = databaseCodeGen.getStoreCode(response);
                    code += '\nreplier(this.uuid, "' + response['value'] + '");';
                }

                else if(response['type'] == 'update')
                {
                    code = databaseCodeGen.getUpdateCode(response);
                    transitionCode = databaseCodeGen.getTransitionCode(response, updateTemplate);
                }
            }

            newState = newState.replace('#code', code);
            
            
            //Generating transitions
            let transitions = botStates[state]['transitions'];
            let entryCode = ''
            let stringFound = false;
            let oldTransitionCode = transitionCode;

            if(transitions != undefined)
            {
                entryCode += Object.keys(transitions);
                for(transition in transitions)
                {
                    if(transition == 'string')
                        stringFound = true;
                    // for this to be triggered, syntax tree should have name parameter which will be used to put it in the datastore.
                    transitionCode = transitions[transition]['name'] == undefined ? '' : 'data[this.uuid]["store"]["' + transitions[transition]['name'] + '"] = data[this.uuid]["context"].result.resolvedQuery;'
                    //transition specific changes
                    if(transitions[transition]['nextState'] != undefined)
                    {
                        transitionCode += 'this.transition("' + transitions[transition]['nextState'] + 'State");'
                    }

                    else if(transitions[transition]['reply'] != undefined)
                    {
                        transitionCode += 'replier(this.uuid, "' + transitions[transition]['reply'] + '");\nconversations.done(this.uuid);'
                    }

                    else if(transitions[transition]['function'] != undefined)
                    {
                        transitionCode += functionCodeGen.getFunctionCode({'value': transitions[transition]['function']});
                        functions[bot].push(transitions[transition]['function']);
                    }

                    else if(transitions[transition]['mb'] != undefined)
                    {
                        let botName = transitions[transition]['mb'] + 'Bot';
                        transitionCode += 'bots[this.uuid] = new ' + botName + '({uuid: this.uuid, parent: this, rootIntent: this.rootIntent})';
                    }

                    if(transition != 'string')
                        newState = newState.replace('//transitions', transition + ': function(){Logger.log(this.uuid, this.name + " got event : ' + transition + ' in state ' + state + '");' + transitionCode + '},' + '\n//transitions')
                    else
                        newState = newState.replace('#code', 'Logger.log(this.uuid, this.name + " got event : ' + transition + ' in state ' + state + '");\n' + transitionCode);
                }
            }

            if(!stringFound)
                newState = newState.replace('#code', oldTransitionCode == undefined ? code : oldTransitionCode);

            newState = newState.replace('//transitions', '"*": function() {Logger.log(this.uuid, this.name + " got event : * ");this.parent.handle("back", data[this.uuid]["intent"], this.rootIntent);}');
            newState = newState.replace('//expected', 'data[this.uuid]["expectedIntents"][this.rootIntent] = ["' + entryCode.replace(new RegExp(',', 'g'), '","') + '"]');
            newDialog = newDialog.replace('//states', newState + ',\n//states');
        }
        dialogs[bot + "Bot"] = (beautify(newDialog));
    }
    return dialogs;
}

module.exports = generator