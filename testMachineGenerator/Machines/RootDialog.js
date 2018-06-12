var machina = require('machina')
var replier = require('../Utils/reply')
var Logger = require('../Utils/logger')
var data = require('../data')
var bots = require('../bot')
var impl = require('../rootImpl')
var fallback = require('./fallback')
var conversations = require('../conversations')
var addBot = require("./addBot");
var listBot = require("./listBot");
var updateBot = require("./updateBot");
var removeBot = require("./removeBot");
//require

module.exports = machina.Fsm.extend({

    initialize: function(options) {
        this.uuid = options.uuid;
        this.stack = [];
        this.maxSize = 5;
        this.name = 'RootMachine';
    },

    initialState: 'startState',

    states: {
        startState: {
            _onEnter: function() {

            },
            string: function() {
                replier(this.uuid, fallback);
                conversations.done(this.uuid);
            },
            '*': function() {
                replier(this.uuid, fallback);
                conversations.done(this.uuid);
            },
            addTodo: function() {
                this.transition("addTodoState")
            },
            showTodo: function() {
                this.transition("showTodoState")
            },
            updateTodo: function() {
                this.transition("updateTodoState")
            },
            deleteTodo: function() {
                this.transition("deleteTodoState")
            },
            welcome: function() {
                this.transition("welcomeState")
            },
            //allTransitions
        },
        addTodoState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                bots[this.uuid] = new addBot({
                    uuid: this.uuid,
                    parent: this,
                    rootIntent: "addTodo"
                });
            },
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                        break;
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            addTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : addTodo");
                bots[this.uuid] = new addBot({
                    uuid: this.uuid,
                    parent: this,
                    rootIntent: "addTodo"
                });
            },
            showTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : showTodo");
                this.transition("showTodoState")
            },
            updateTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : updateTodo");
                this.transition("updateTodoState")
            },
            deleteTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : deleteTodo");
                this.transition("deleteTodoState")
            },
            welcome: async function() {
                Logger.log(this.uuid, this.name + " got event : welcome");
                this.transition("welcomeState")
            },
            //transitions
        },
        showTodoState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                bots[this.uuid] = new listBot({
                    uuid: this.uuid,
                    parent: this,
                    rootIntent: "showTodo"
                });
            },
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                        break;
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            addTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : addTodo");
                this.transition("addTodoState")
            },
            showTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : showTodo");
                bots[this.uuid] = new listBot({
                    uuid: this.uuid,
                    parent: this,
                    rootIntent: "showTodo"
                });
            },
            updateTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : updateTodo");
                this.transition("updateTodoState")
            },
            deleteTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : deleteTodo");
                this.transition("deleteTodoState")
            },
            welcome: async function() {
                Logger.log(this.uuid, this.name + " got event : welcome");
                this.transition("welcomeState")
            },
            //transitions
        },
        updateTodoState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                bots[this.uuid] = new updateBot({
                    uuid: this.uuid,
                    parent: this,
                    rootIntent: "updateTodo"
                });
            },
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                        break;
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            addTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : addTodo");
                this.transition("addTodoState")
            },
            showTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : showTodo");
                this.transition("showTodoState")
            },
            updateTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : updateTodo");
                bots[this.uuid] = new updateBot({
                    uuid: this.uuid,
                    parent: this,
                    rootIntent: "updateTodo"
                });
            },
            deleteTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : deleteTodo");
                this.transition("deleteTodoState")
            },
            welcome: async function() {
                Logger.log(this.uuid, this.name + " got event : welcome");
                this.transition("welcomeState")
            },
            //transitions
        },
        deleteTodoState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                bots[this.uuid] = new removeBot({
                    uuid: this.uuid,
                    parent: this,
                    rootIntent: "deleteTodo"
                });
            },
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                        break;
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            addTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : addTodo");
                this.transition("addTodoState")
            },
            showTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : showTodo");
                this.transition("showTodoState")
            },
            updateTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : updateTodo");
                this.transition("updateTodoState")
            },
            deleteTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : deleteTodo");
                bots[this.uuid] = new removeBot({
                    uuid: this.uuid,
                    parent: this,
                    rootIntent: "deleteTodo"
                });
            },
            welcome: async function() {
                Logger.log(this.uuid, this.name + " got event : welcome");
                this.transition("welcomeState")
            },
            //transitions
        },
        welcomeState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                replier(this.uuid, "Hey! I can manage your todo list!");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                        break;
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            addTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : addTodo");
                this.transition("addTodoState")
            },
            showTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : showTodo");
                this.transition("showTodoState")
            },
            updateTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : updateTodo");
                this.transition("updateTodoState")
            },
            deleteTodo: async function() {
                Logger.log(this.uuid, this.name + " got event : deleteTodo");
                this.transition("deleteTodoState")
            },
            welcome: async function() {
                Logger.log(this.uuid, this.name + " got event : welcome");
                replier(this.uuid, "Hey! I can manage your todo list!");
                conversations.done(this.uuid);
            },
            //transitions
        },
        //states
    }
});