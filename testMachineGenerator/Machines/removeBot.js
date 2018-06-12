var machina = require('machina')
var replier = require('../Utils/reply')
var data = require('../data')
var bots = require('../bot')
var Logger = require('../Utils/logger')
var impl = require('../removeBotImpl')
var conversations = require('../conversations')
//require

module.exports = machina.Fsm.extend({

    initialize: function(options) {
        this.uuid = options.uuid;
        this.parent = options.parent;
        this.rootIntent = options.rootIntent;
        this.name = 'removeBot';
    },

    initialState: 'startState',

    states: {
        startState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                data[this.uuid]["expectedIntents"][this.rootIntent] = ["number"]
                impl.showAndAskWhichToUpdate(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
            string: async function() {
                impl.showAndAskWhichToUpdate(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
            back: function(intent, rootIntent) {
                this.handle(intent);
            },
            number: function() {
                Logger.log(this.uuid, this.name + " got event : number in state start");
                impl.deleteTodo(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
            "*": function() {
                Logger.log(this.uuid, this.name + " got event : * ");
                this.parent.handle("back", data[this.uuid]["intent"], this.rootIntent);
            }
        },
        //states
    }
});