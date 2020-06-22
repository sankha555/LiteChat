const socket = io()
//const {io} = require('../../server')
const messageForm = document.getElementById('send-form')
const messageInput = document.getElementById('btn-input')
const messageCallout = document.getElementById('message-container')
const chatbox = document.getElementById('chatbox')
var status_holder = document.getElementById('statuses')
const sender_email = document.getElementById('sender_email').innerText
const recipient_email = document.getElementById('recipient_email').innerText

console.log('here at 11')

socket.emit('user-connected', {'room': document.getElementById('chat_id').innerText})

socket.on('recipient-is-in', () => {
    console.log('recipient in')
    var status = document.getElementById('status')
    status.innerHTML = "Active"
    status_holder.appendChild(status)
    var x = document.getElementsByClassName('messages msg_sent')
    for(var i = 0; i < x.length; i++){
        x[i].setAttribute("style", "background-color: lightgreen;")
    }
})

socket.on('recipient-out', () => {
    console.log('recipient in')
    var status = document.getElementById('status')
    status.innerHTML = ""
    status_holder.append(status)
})

socket.on('is-typing', (data) => {
    console.log('here in typing')
    if (data.true){
        var status = document.getElementById('status')
        status.innerHTML = "typing..."
        status_holder.append(status)
    }

})

socket.on('chat-message', data => {
    appendMessage(data.message, data.image, true)
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
        image: null,
        timestamp: new Date(),
    }
    data.seen = ((document.getElementById('status').innerHTML === "Active") ? true : false)
    appendMessage(data, null, false)
})

function appendMessage(message, image, received) {
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    if (received) {
        let receive_row = document.createElement('div')
        receive_row.setAttribute("class", "row msg_container base_receive")
        let receive_col = document.createElement('div')
        receive_col.setAttribute("class", "col-xs-10 col-md-10")
        let sender_img_holder = document.createElement('div')
        sender_img_holder.setAttribute("class", "col-md-2 col-xs-2 avatar")
        let sender_img = document.createElement('img')
        sender_img.setAttribute("class", "img-responsive")
        sender_img.setAttribute("src", image)
        sender_img.setAttribute("style", "width: 80px; height: 80px; border-radius: 40px;")

        sender_img_holder.appendChild(sender_img)

        let message_text = document.createElement('div')
        message_text.setAttribute("class", "messages msg_receive")
        let msg_content = document.createElement('p')
        let msg_time = document.createElement('i')

        let timestamp = new Date(message.timestamp)
        msg_time.innerText = timestamp.getDate() + " " + shortMonths[timestamp.getMonth()] + " " + ((timestamp.getFullYear()) % 100) + " - " + ((timestamp.getHours()) % 12) + ":" + ((timestamp.getMinutes() < 10) ? ("0" + timestamp.getMinutes()) : (timestamp.getMinutes())) + " " + ((timestamp.getHours() > 12) ? "pm" : "am") 
        msg_content.innerText = message.content
        message_text.appendChild(msg_content)
        message_text.appendChild(msg_time)
        receive_col.appendChild(message_text)
        receive_row.appendChild(sender_img_holder)
        receive_row.appendChild(receive_col)

        chatbox.appendChild(receive_row)
        chatbox.scrollTop = chatbox.scrollHeight
    } else {

        let sent_row = document.createElement('div')
        sent_row.setAttribute("class", "row msg_container base_sent")
        let sent_col = document.createElement('div')
        sent_col.setAttribute("class", "col-xs-10 col-md-10")
        let message_text = document.createElement('div')
        message_text.setAttribute("class", "messages msg_sent")
        message.seen ? message_text.setAttribute("style", "background-color: lightgreen;") : message_text.setAttribute("style", "background-color: lightblue;")
        let msg_content = document.createElement('p')
        let msg_time = document.createElement('i')

        let timestamp = new Date(message.timestamp)
        msg_time.innerText = timestamp.getDate() + " " + shortMonths[timestamp.getMonth()] + " " + ((timestamp.getFullYear())%100) + " - " + ((timestamp.getHours())%12) + ":" + ((timestamp.getMinutes() < 10) ? ("0" + timestamp.getMinutes()) : (timestamp.getMinutes())) + " " + ((timestamp.getHours() > 12) ? "pm" : "am") 
        msg_content.innerText = message.content
        message_text.appendChild(msg_content)
        message_text.appendChild(msg_time)
        sent_col.appendChild(message_text)
        sent_row.appendChild(sent_col)

        chatbox.appendChild(sent_row)
        chatbox.scrollTop = chatbox.scrollHeight
    }
    
}