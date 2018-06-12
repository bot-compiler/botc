var machina = require('machina')
var replier = require('../Utils/reply')
var data = require('../data')
var bots = require('../bot')
var Logger = require('../Utils/logger')
var impl = require('../addBotImpl')
var conversations = require('../conversations')
//require

module.exports = machina.Fsm.extend({

    initialize: function(options) {
        this.uuid = options.uuid;
        this.parent = options.parent;
        this.rootIntent = options.rootIntent;
        this.name = 'addBot';
    },

    initialState: 'startState',

    states: {
        startState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                data[this.uuid]["expectedIntents"][this.rootIntent] = ["yes", "no"]
                replier(this.uuid, "Shall I go ahead and add this todo?");
                conversations.done(this.uuid);
            },
            string: async function() {
                replier(this.uuid, "Shall I go ahead and add this todo?");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                this.handle(intent);
            },
            yes: function() {
                Logger.log(this.uuid, this.name + " got event : yes in state start");
                impl.addTodoToList(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
                    if (type == 'text') {
                        replier(this.uuid, value, async);
                    } else if (type == 'microbot') {
                        var mb = require('./' + value + 'Bot');
                        bots[this.uuid] = new mb({
                            uuid: this.uuid,
                            parent: this,
                            rootIntent: this.rootIntent
                        });
                    } else if (type == 'transition') {
                        this.transition(value != 'string' ? value + 'State' : value);
                    }
                });
            },
            no: function() {
                Logger.log(this.uuid, this.name + " got event : no in state start");
                this.transition("rejectedStateState");
            },
            "*": function() {
                Logger.log(this.uuid, this.name + " got event : * ");
                this.parent.handle("back", data[this.uuid]["intent"], this.rootIntent);
            }
        },
        rejectedStateState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                data[this.uuid]["expectedIntents"][this.rootIntent] = ["string"]
                replier(this.uuid, "Alright!");
                conversations.done(this.uuid);
            },
            string: async function() {
                Logger.log(this.uuid, this.name + " got event : string in state rejectedState");
                replier(this.uuid, "I have not added the todo!");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                this.handle(intent);
            },
            "*": function() {
                Logger.log(this.uuid, this.name + " got event : * ");
                this.parent.handle("back", data[this.uuid]["intent"], this.rootIntent);
            }
        },
        //states
    }
});