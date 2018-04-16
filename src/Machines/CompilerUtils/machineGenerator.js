var beautify = require('js-beautify').js_beautify;
var fs = require('fs');
var ncp = require('ncp').ncp;
var microBotGenerator = require('./microBotGenerator')
var databaseCodeGen = require('./dataBaseCodeGen')
var dialogFlow = require('../../DialogFlow');
var functionCodeGen = require('./functionCodeGen');
var path = require('path');

let stateTemplate = fs.readFileSync(path.join(__dirname, 'stateTemplate.txt'), 'utf-8')
let dialogTemplate = fs.readFileSync(path.join(__dirname, 'dialogTemplate.txt'), 'utf-8')
let indexTemplate = fs.readFileSync(path.join(__dirname, 'indexTemplate.txt'), 'utf-8')
let updateTemplate = fs.readFileSync(path.join(__dirname, 'updateCode.txt'), 'utf-8')
let implTemplate = fs.readFileSync(path.join(__dirname, 'implTemplate.txt'), 'utf-8')
let implFunctionTemplate = fs.readFileSync(path.join(__dirname, 'implFunctionTemplate.txt'), 'utf-8');
let msftTemplate = fs.readFileSync(path.join(__dirname, 'msftTemplate.txt'), 'utf-8');

function getStateEntryCode(response, intent, functions)
{
    if(response['type'] == 'text')
        return 'replier(this.uuid, "' + response['value'] + '");\nconversations.done(this.uuid);';
    
    else if(response['type'] == 'store')
    {
        //Default table being used, need to change this, ask table name from the user in responseFlowMachine
        // context.result.parameters
        let code = databaseCodeGen.getStoreCode(response) + '\nreplier(this.uuid, "' + response['value'] + '");';  
        return code;
    }

    else if(response['type'] == 'mb')
    {
        return 'bots[this.uuid] = new ' + response['value'] + 'Bot({uuid: this.uuid, parent: this, rootIntent:"' + intent + '"});'
    }

    else if(response['type'] == 'get')
    {
        return databaseCodeGen.getRetrieveCode(response);
    }

    else if(response['type'] == 'update')
    {
        return databaseCodeGen.getUpdateCode(response);
    }

    else if(response['type'] == 'function')
    {
        functions.push(response['value']);
        return 'this.rootIntent = "' + intent + '"; ' + functionCodeGen.getFunctionCode(response);
        //DELETE operation
    }
}

function createStates(syntaxTree, functions)
{
    let states = []
    let intents = Object.keys(syntaxTree["intents"]);

    for(let i = 0; i < intents.length; ++i)
    {
        let newState = stateTemplate.replace('#stateName', intents[i] + "State");

        // CODE generation part
        let response = syntaxTree["intents"][intents[i]]["response"];
        let code = getStateEntryCode(response, intents[i], functions);
        
        if(response['type'] == 'update' || response['type'] == 'delete')
        {
            // replace newState's transition with this transition code
            newState = newState.replace('//transitions', databaseCodeGen.getTransitionCode(response, updateTemplate + ',\n//transitions'));
        }

        newState = newState.replace("#code", code);
        
        // create states here
        for(let j = 0; j < intents.length; ++j)
        {
            // Add transitions here
            if(intents[j] != intents[i])
            {
                newState = newState.replace('//transitions', intents[j] + ': async function(){Logger.log(this.uuid, this.name + " got event : ' + intents[j] + '"); this.transition("' + intents[j] + 'State")},\n//transitions');
            }

            else
            {
                newState = newState.replace('//transitions', intents[j] + ': async function(){Logger.log(this.uuid, this.name + " got event : ' + intents[j] + '");' + code + '},\n//transitions');  
            }
        }
        states.push(newState);
    }
    return states;
}

function getDialog(syntaxTree, functions)
{
    let intents = Object.keys(syntaxTree["intents"])
    functions['root'] = []
    let states = createStates(syntaxTree, functions['root']);
    let dialog = dialogTemplate;

    for(let i in states)
    {
        dialog = dialog.replace('//states', states[i] + ',\n//states');
    }

    for(let i in intents)
    {
        dialog = dialog.replace('//allTransitions', intents[i] + ': function(){this.transition("' + intents[i] + 'State")},\n//allTransitions');
    }
    return dialog;
}

function getIndexFile(intents)
{
    let indexFile = indexTemplate + '';
    for(let i = 0; i < intents.length; ++i)
    {
        let condition = 'else if';
        
        if(i == 0)
            condition = 'if';

        indexFile = indexFile.replace('//event', condition + '(intent == "' + intents[i] + '")\nbots[uuid].handle("' + intents[i] + '", req.body, res);\n//event');
    }
    return indexFile;
}

function getImplFile(functions, template = implTemplate)
{
    let implFile = template;
    var unique = functions.filter(function(item, i, arr){ return arr.indexOf(item) == i; });
    for(let i = 0; i < unique.length; ++i)
    {
        implFile = implFile.replace('//function', implFunctionTemplate.replace('#name', unique[i]) + '\n//function');
    }
    return implFile;
}

function createDialogFlowModel(syntaxTree)
{
    let df = dialogFlow(syntaxTree['token']);
    df.entities.create(syntaxTree, function(error, results) {
        if(error) {
            return console.log("error in entity creation!");
        }
        console.log(results);
        df.intents.useWebHook(() => {console.log('Done default')});
        df.intents.create(syntaxTree, function(error, results) {        
            if(error) {
                return console.log (error + "\n\nError in intents creation \n\n");
            }
            console.log(results)
        })
    });
}

function getMsftFile()
{
    return msftTemplate;
}

function createBot(syntaxTree, createDialogFlow = false)
{
    var functions = {}
    let rootDialog = beautify(getDialog(syntaxTree, functions));
    let indexFile = beautify(getIndexFile(Object.keys(syntaxTree["intents"])));
    let microBots = microBotGenerator(syntaxTree['microBots'], functions);
    let rootImplFile = beautify(getImplFile(functions['root']));
    let msftFile = beautify(getMsftFile());

    let cwd = process.cwd();

    if(createDialogFlow)
    {
        for(subIntent in syntaxTree['subIntents'])
        {
            syntaxTree['intents'][subIntent] = syntaxTree['subIntents'][subIntent];
        }
        try {
            createDialogFlowModel(syntaxTree);
        } catch (error) {
           throw new Error('Could not create dialogflow model ' + error); 
        }
        
    }    

    ncp(path.join(__dirname, 'Template'), cwd, (err) => {
        if(err){
            throw new Error('Error while copying template ' + err);
        }
        else
        {
            for(mb in microBots)
            {
                let mbPath = path.join(cwd, 'Machines', mb + '.js');
                fs.writeFileSync(mbPath, microBots[mb].replace('#machineName', mb).replace('#machineName', mb));
                let mbName = mb.replace('Bot', '');
                if(functions[mbName] != undefined)
                {
                    let implFile = beautify(getImplFile(functions[mbName]));
                    let implFilePath = path.join(cwd, mb + 'Impl.js');
                    fs.writeFileSync(implFilePath, implFile, 'utf-8');
                }

                rootDialog = rootDialog.replace('//require', 'var ' + mb + ' = require("' + './' + mb + '");\n//require');
            }
                
            fs.writeFileSync(path.join(cwd, 'index.js'), indexFile, 'utf-8');
            fs.writeFileSync(path.join(cwd, 'Machines', 'RootDialog.js'), rootDialog, 'utf-8');
            fs.writeFileSync(path.join(cwd, 'rootImpl.js'), rootImplFile, 'utf-8');
            fs.writeFileSync(path.join(cwd, 'msft.js'), msftFile, 'utf-8');
            fs.writeFileSync(path.join(cwd, 'functions.json'), JSON.stringify(functions, null, '\t'));
        }
    });
}

function updateBot(syntaxTree)
{
    var functions = {}
    let rootDialog = beautify(getDialog(syntaxTree, functions));
    let indexFile = beautify(getIndexFile(Object.keys(syntaxTree["intents"])));
    let microBots = microBotGenerator(syntaxTree['microBots'], functions);
    let msftFile = beautify(getMsftFile());

    let cwd = process.cwd();
    let oldFunctions;

    try {
        oldFunctions = JSON.parse(fs.readFileSync(path.join(cwd, 'functions.json'), 'utf-8'));   
    } catch (error) {
        throw new Error('functions.json not found or cannot be parsed');
    }

    for(mb in microBots)
    {
        let mbPath = path.join(cwd, 'Machines', mb + '.js');
        fs.writeFileSync(mbPath, microBots[mb].replace('#machineName', mb).replace('#machineName', mb));
        let mbName = mb.replace('Bot', '');
        if(functions[mbName])
        {
            let newFunctions = functions[mbName];
            if(oldFunctions[mbName])
            {
                newFunctions = functions[mbName].filter(
                    (func) => 
                       { return (oldFunctions[mbName].indexOf(func) == -1); }
                );
            }

            let implFile;
            let implFilePath = path.join(cwd, mb + 'Impl.js');

            if(!oldFunctions[mbName])
                implFile = beautify(getImplFile(newFunctions));
            else
            {
                implFile = beautify(getImplFile(newFunctions, fs.readFileSync(implFilePath, 'utf-8')));
            }
            
            fs.writeFileSync(implFilePath, implFile, 'utf-8');
        }

        rootDialog = rootDialog.replace('//require', 'var ' + mb + ' = require("' + './' + mb + '");\n//require');
    }
    
    let rootImplFile;

    if(!oldFunctions['root'])
        rootImplFile = beautify(getImplFile(functions['root']));
    else
    {
        let newFunctions = functions['root'].filter(
            (func) => 
               { return (oldFunctions['root'].indexOf(func) == -1); }
        );
        rootImplFile = beautify(getImplFile(newFunctions, fs.readFileSync(path.join(cwd, 'rootImpl.js'), 'utf-8')));
    }

    fs.writeFileSync(path.join(cwd, 'index.js'), indexFile, 'utf-8');
    fs.writeFileSync(path.join(cwd, 'Machines', 'RootDialog.js'), rootDialog, 'utf-8');
    fs.writeFileSync(path.join(cwd, 'rootImpl.js'), rootImplFile, 'utf-8');
    fs.writeFileSync(path.join(cwd, 'functions.json'), JSON.stringify(functions, null, '\t'));
}

module.exports = {
    create: createBot,
    update: updateBot
};
