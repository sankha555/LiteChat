const socket = io()
//const {io} = require('../../server')
const messageForm = document.getElementById('send-form')
const messageInput = document.getElementById('btn-input')
const messageCallout = document.getElementById('message-container')
const chatbox = document.getElementById('chatbox')
const status = document.getElementById('status').innerText
const sender_email = document.getElementById('sender_email').innerText
const recipient_email = document.getElementById('recipient_email').innerText

console.log('here at 11')

socket.emit('user-connected', {'room': document.getElementById('chat_id').innerText})

$(document).ready(function () {
    console.log('here at 13')
    var chatbox = document.getElementById('chatbox')
    chatbox.scrollTop = chatbox.scrollHeight

    $('#btn-input').keypress((e) => {
        //const socket = io('https://litechat-im.herokuapp.com:3000')
        socket.emit('typing', { 'true': true })
    })

})

$(window).focus(function () {
    //const socket = io('https://litechat-im.herokuapp.com:3000')
    socket.emit('in-tab', { 'room': document.getElementById('chat_id').innerText })
})

$(window).blur(function () {
    //const socket = io('https://litechat-im.herokuapp.com:3000')
    socket.emit('out-of-tab', { 'room': document.getElementById('chat_id').innerText })
})

socket.on('recipient-is-in', () => {
    status = "Active"
    var x = document.getElementsByClassName('messages msg_sent')
    for(var i = 0; i < x.length; i++){
        x[i].setAttribute("style", "background-color: lightgreen;")
    }
})

socket.on('recipient-out', () => {
    status = ""
})

socket.on('is-typing', (data) => {
    console.log('here in typing')
    if (data.true)
        status = "typing..."
})

socket.on('chat-message', data => {
    appendMessage(data.message, true)
    if (data.alert) {
        // in next verion :)
    }
})

messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    socket.emit('send-message', { 'message': message, 'sender_email': sender_email, 'status': status, 'room': document.getElementById('chat_id').innerText })
    messageInput.value = ''

    data = {
        content: message,
        timestamp: new Date(),
    }
    data.seen = ((status === "Active") ? true : false)
    appendMessage(data, false)
})

function appendMessage(message, received) {
    if (received) {
        const receive_row = document.createElement('div')
        receive_row.setAttribute("class", "row msg_container base_receive")
        const receive_col = document.createElement('div')
        receive_col.setAttribute("class", "col-xs-10 col-md-10")
        const message_text = document.createElement('div')
        message_text.setAttribute("class", "messages msg_receive")
        const msg_content = document.createElement('p')
        const msg_time = document.createElement('p')

        msg_time.inputHTML = '<i>' + message.timestamp + '</i>'
        msg_content.innerText = message.content
        message_text.appendChild(msg_content)
        message_text.appendChild(msg_time)
        receive_col.appendChild(message_text)
        receive_row.appendChild(receive_col)

        chatbox.appendChild(receive_row)
    } else {

        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        const sent_row = document.createElement('div')
        sent_row.setAttribute("class", "row msg_container base_sent")
        const sent_col = document.createElement('div')
        sent_col.setAttribute("class", "col-xs-10 col-md-10")
        const message_text = document.createElement('div')
        message_text.setAttribute("class", "messages msg_sent")
        message.seen ? message_text.setAttribute("style", "background-color: lightgreen;") : message_text.setAttribute("style", "background-color: lightblue;")
        const msg_content = document.createElement('p')
        const msg_time = document.createElement('i')

        msg_time.innerText = message.timestamp.getDate() + " " + shortMonths[message.timestamp.getMonth()] + " " + (message.timestamp.getFullYear()) % 100 + " - " + (message.timestamp.getHours())%12 + ":" + ((message.timestamp.getMinutes() < 10) ? "0"+message.timestamp.getMinutes() : message.timestamp.getMinutes()) + " " + ((message.timestamp.getHours() > 12) ? "pm" : "am") 
        msg_content.innerText = message.content
        message_text.appendChild(msg_content)
        message_text.appendChild(msg_time)
        sent_col.appendChild(message_text)
        sent_row.appendChild(sent_col)

        chatbox.appendChild(sent_row)
        chatbox.scrollTop = chatbox.scrollHeight
    }
    
}