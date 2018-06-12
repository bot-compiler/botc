var generator = require('../src/Machines/CompilerUtils/machineGenerator')
var semanticAnalyser = require('../src/Semantic Analyser/analyser')

var bot = 
{
    "intents": [
        {
            "name": "addTodo",
            "utterances": [],
            "parameters": [],
            "response": {
                "type": "mb",
                "value": "add"
            }
        },
        {
            "name": "showTodo",
            "utterances": [],
            "parameters": [],
            "response": {
                "type": "mb",
                "value": "list"
            }
        },
        {
            "name": "updateTodo",
            "utterances": [],
            "parameters": [],
            "response": {
                "type": "mb",
                "value": "update"
            }
        },
        {
            "name": "deleteTodo",
            "utterances": [],
            "parameters": [],
            "response": {
                "type": "mb",
                "value": "remove"
            }
        },
        {
            "name": "welcome",
            "utterances": [],
            "parameters": [],
            "response": {
                "type": "text",
                "value": "Hey! I can manage your todo list!"
            }
        }
    ],
    "token": "a3a02f0eb95e4de6a53cc978664dbe82",
    "about": "I am A bot you moron",
    "subIntents": [
        {
            "name": "deleteTodoAt",
            "utterances": [],
            "parameters": []
        },
        {
            "name": "updateTodoAt",
            "utterances": [],
            "parameters": []
        },
        {
            "name": "yes",
            "utterances": [],
            "parameters": []
        },
        {
            "name": "no",
            "utterances": [],
            "parameters": []
        },
        {
            "name": "number",
            "utterances": [],
            "parameters": []
        },
        {
            "name": "isswag",
            "utterances": [],
            "parameters": []
        }
    ],
    "entities": [],
    "microBots": [
        {
            "name": "add",
            "states": [
                {
                    "name": "start",
                    "response": {
                        "type": "text",
                        "value": "Shall I go ahead and add this todo?"
                    },
                    "transitions": [
                        {
                            "name": "yes",
                            "function": "addTodoToList"
                        },
                        {
                            "name": "no",
                            "nextState": "rejectedState"
                        }  
                    ]
                },
                {
                    "name": "rejectedState",
                    "response": {
                        "type": "text",
                        "value": "Alright!"
                    },
                    "transitions": [
                        {
                            "name": "string",
                            "reply": "I have not added the todo!"
                        }
                    ]
                }
            ]
        },
        {
            "name": "list",
            "states": [
                {
                    "name": "start",
                    "response": {
                        "type": "function",
                        "value": "showTodos"
                    },
                    "transitions": [
                        {
                            "name": "deleteTodoAt",
                            "function": "deletTodoAt"
                        },
                        {
                            "name": "updateTodoAt",
                            "function": "updateTodoAt"
                        }
                    ]
                }
            ]
        },
        {
            "name": "update",
            "states": [
                {
                    "name": "start",
                    "response": {
                        "type": "function",
                        "value": "showAndAskWhichToUpdate"
                    },
                    "transitions": [
                        {
                            "name": "number",
                            "function": "updateTodo"
                        }
                    ]
                }
            ]
        },
        {
            "name": "remove",
            "states": [
                {
                    "name": "start",
                    "response": {
                        "type": "function",
                        "value": "showAndAskWhichToUpdate"
                    },
                    "transitions": [
                        {
                            "name": "number",
                            "function": "deleteTodo"
                        }
                    ]
                }
            ]
        }
    ]
}

let syntaxTree = semanticAnalyser(bot);
generator.update(syntaxTree, true);