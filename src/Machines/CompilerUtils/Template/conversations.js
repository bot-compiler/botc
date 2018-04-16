module.exports = {
    done: function(uuid) {
        this[uuid].leave();
    }
}