var addMessageToLog = function(message, author) {
    if (message == '') {
        return;
    }
    
    var msg_count = messageHistory.length;
    var message = {
        id: msg_count,
        text: message,
        author: author,
        datetime: 'December 25, 1995 23:15:20'
    }
    messageHistory.unshift(message);
}

var submitMessage = function() {
    var message_element = document.getElementById('chat-input');
    var message_text = message_element.value;
    addMessageToLog(message_text, 'author-user');
    message_element.value = '';

    $.ajax({
        url: 'submit-message',
        type: 'POST',
        data: { text: message_text },
        success: function(res) {
            addMessageToLog(res.text, 'author-other');
            updateProducts(res.products);
        },
        error: function(err) {
            console.log(`Error: ${err}`);
        }
    });
}

var scrollChatToBottom = function() {
    var chat_log = document.getElementById('chat-log');
    chat_log.scrollTop = chat_log.scrollHeight;
}

Vue.component('message-item', {
    props: ['message'],
    template: 
    '<div class="message">' +
    '    <div class="message-content">{{ message.text }}</div>' + 
    '    <div class="message-datetime">{{ message.datetime }}</div>' +
    '</div>'
})

var messageHistory = [
    { id: 0, text: 'Yes, can I have a dozen red roses please.', author: 'author-user', datetime: 'December 25, 1995 23:15:20' },
    { id: 1, text: 'Oh hai Johnny, I didn\'t know it was you.', author: 'author-other', datetime: 'December 25, 1995 23:15:20' },
    { id: 2, text: 'That\'s me. How much is it?', author: 'author-user', datetime: 'December 25, 1995 23:15:20' },
    { id: 3, text: 'That\'ll be $18.', author: 'author-other', datetime: 'December 25, 1995 23:15:20' },
    { id: 4, text: 'Here you go, keep the change, hai doggy.', author: 'author-user', datetime: 'December 25, 1995 23:15:20' },
    { id: 5, text: 'You\'re my favorite customer.', author: 'author-other', datetime: 'December 25, 1995 23:15:20' },
    { id: 6, text: 'Thanks a lot. Bye.', author: 'author-user', datetime: 'December 25, 1995 23:15:20' }
].slice().reverse();

var chat = new Vue({
    el: '#chat-log',
    data: {
        messages: messageHistory
    },
    updated: scrollChatToBottom
})