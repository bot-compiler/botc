function parseMicroBot(microBot, intents, mbs, errors)
{
    let result = {};
    let states = [];
    let startFound = false;
    microBot.states.map((state) => {states.push(state['name']); 
        if(state['name'] == 'start')
            startFound = true;
    });
    
    if(!startFound)
        errors.push({'message': 'No start state found', 'microBot': microBot['name']});

    microBot.states.map((state) => {
        let key = state['response']['type'];
        let value = state['response']['value'];

        if(key == 'mb' && !checkMbExists(value, mbs))
            errors.push({'message': 'MicroBot not valid', 'state': state['name'], 'where': state['response']});

        else if(key == 'function' && !checkAlphaNumeric(value))
            errors.push({'message': 'Function name not valid, only alphanumeric', 'state': state['name'], 'where': state['response']});
        
        result[state['name']] = {"response": state['response'], "transitions": parseTransitions(state['transitions'], intents, mbs, states, state['name'], microBot, errors)};
    });
    return result;
}

function parseTransitions(transitions, intents, mbs, states, currentState, cmb, errors)
{
    let result = {}
    transitions.map((transition) => {
        let name = transition['name'];

        if(!checkTrasnitionNameIsIntent(name, intents))
            errors.push({'message': 'Intent/subIntent not found for transition', 'transition': transition, 'state': currentState, 'microBot': cmb['name']});

        if(transition['mb'] && !checkMbExists(transition['mb'], mbs))
            errors.push({'message': 'MicroBot not found for transition', 'transition': transition, 'state': currentState, 'microBot': cmb['name']});

        else if(transition['function'] && !checkAlphaNumeric(transition['function']))
            errors.push({'message': 'Function name not valid, only alphanumeric', 'state': currentState, 'transition': transition, 'microBot': cmb['name']});
        
        else if(transition['nextState'] && !checkIfStateInTransitionExists(transition['nextState'], states))
            errors.push({'message': 'nextState not valid, not present in this microbot', 'state': currentState, 'transition': transition, 'microBot': cmb['name']})
        

        result[transition['name']] = transition;
        delete result[transition['name']]['name']
    });
    return result;
}

/**
 *@description symantic analysis of the parse tree 
 * @param {any} parseTree 
 * @returns syntax tree if the parse tree is symantically right, throws an error otherwise
 */
function convertParseTree(parseTree)
{
    let syntaxTree = {};
    let errors = []
    let intents = {}
    let subIntents = {}
    let entities = {}
    let mbs = [];
    let allIntents = [];

    parseTree.microBots.map((microBot) => {
        mbs.push(microBot['name']);
    });

    parseTree.intents.map((intent) => {
        intents[intent['name']] = intent;
        allIntents.push(intent['name']);
        let key = intent['response']['type'];
        let value = intent['response']['value'];

        if(key == 'mb' && !checkMbExists(value, mbs))
            errors.push({'message': 'MicroBot not valid', 'intent': intent['name'], 'where': intent['response']});

        else if(key == 'function' && !checkAlphaNumeric(value))
            errors.push({'message': 'Function name not valid, only alphanumeric', 'intent': intent['name'], 'where': intent['response']});
    });

    parseTree.entities.map((entity) => {
        entities[entity.name] = entity.values;
    })

    parseTree.subIntents.map((subIntent) => {
        subIntents[subIntent['name']] = subIntent;
        allIntents.push(subIntent['name']);
    });

    let microBots = {}

    parseTree.microBots.map((microBot) => {
        microBots[microBot['name']] = parseMicroBot(microBot, allIntents, mbs, errors);
    });

    syntaxTree.intents = intents;
    syntaxTree.entities = entities;
    syntaxTree.subIntents = subIntents;
    syntaxTree.microBots = microBots;

    if(errors.length > 0)
        throw new Error(JSON.stringify(errors, null, '\t'));
    
    syntaxTree['token'] = parseTree['token'];
    return syntaxTree;
}

// check if response of intent is mb, and mb exists
function checkMbExists(mb, mbs)
{
    return mbs.indexOf(mb) > -1;
}

// check if function name is valid in both responses
function checkAlphaNumeric(value)
{
    return value.match(/^[a-z0-9]+$/i);
}

// check if transition name exists in intents or subIntents
function checkTrasnitionNameIsIntent(transition, intents)
{
    if(transition == 'string')
        return true;
    return intents.indexOf(transition) > -1;
}

// check if state exists in the mb given in transition nextState
function checkIfStateInTransitionExists(nextState, states)
{
    return states.indexOf(nextState) > -1;
}

module.exports = convertParseTree;