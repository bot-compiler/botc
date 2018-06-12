const conversations = require('./conversations')

// IMPORTANT NOTE
// call conversation.done(uuid) after calling replyCallback with 'text' as the
// first argument, you can send as many text replies as you want, make sure to 
// call conversation.done(uuid) after sending them
// do not call conversation.done(uuid) if you are using 'microbot' or 'transition'
// as the parameter to replyCallback. 
// call it when the code path has only 'text' as the parameter in replyCallback

module.exports = {
    //function
}