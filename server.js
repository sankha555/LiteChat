const express = require('express')
const app = express()
const mongoose = require('mongoose')
const swig = require('swig')
const flash = require('connect-flash')
const session = require('express-session')
const moment = require('moment')

// Sockets.io
const socketio = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const io = socketio(server)

// Cookies and Session Handling
const cookie_parser = require('cookie-parser')
const cookieSession = require('cookie-session')

// User authentication
const passport = require('passport')

// Routes and models
var userRouter = require('./routes/users')
const User = require('./models/user')
var chatRouter = require('./routes/chats')
const Chat = require('./models/chat')
const path = require('path') 
const Message = require('./models/message')

// Database connection
mongoose.connect(process.env.MONGO_URI||'mongodb://localhost:27017/chatdb', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

// App properties
app.use(flash())
app.use(cookieSession({
    name: 'my_session',
    keys: ['key1', 'key2']
}))
app.use(express.urlencoded({ extended: false }))
app.use(cookie_parser())
app.locals.moment = require('moment')
//app.use(moment)

const public = path.join(__dirname, './public') 

app.engine('htm', swig.renderFile)
app.set('view engine', 'htm')
app.set('views', public) 
app.use(express.static(public, { index: '_' })) 

// Passport Config
require('./config/passport')(passport)
app.use(passport.initialize())
app.use(passport.session())

// Accessing user as a global object
app.get('*', (req, res, next) => {
    res.locals.user = req.user || null
    next()
})

// Landing Page
app.get('/', (req, res) => {
    if (req.isAuthenticated())
        console.log('user in')
    else
        console.log('user not in')

    res.render('chats/index')
})

// Google Authentication
app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ]
    }
    ));

app.get('/auth/google/callback', passport.authenticate('google', {
    scope:
        [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
    failureRedirect: '/auth/google'
}), function (req, res) {
    res.redirect('/')
})

app.use('/chats', chatRouter)
app.use('/users', userRouter)

// Socket Operations Begin
io.on('connection', socket => {

    // Broadcasting the message to other users
    socket.on('user-connected', async(data) => {
        socket.leave(Object.keys(socket.rooms))
        socket.join(data.room, () => {
            //console.log(Object.keys(socket.rooms))
            //console.log(data.room)  
            socket.to(data.room).emit('recipient-is-in')
        })    
    })
    
    socket.on('typing', (data) => {
        if (data.true === true){
            console.log('here at 109')
            socket.to(Object.keys(socket.rooms)).emit('is-typing', data)
            //io.emit('is-typing', data)
        }
        else
            socket.to(Object.keys(socket.rooms)).emit('is-typing', {'true':false})
    })

    socket.on('in-tab', (data) => {
        socket.to(data.room).emit('recipient-is-in')
    })

    socket.on('out-of-tab', (data) => {
        socket.to(data.room).emit('recipient-out')
    })

    socket.on('send-message', async(data) => {
        let sender = await User.findOne({email: data.sender_email})
        let chat = await Chat.findById(data.room)

        let recipient_email = (chat.user1_email == sender.email) ? chat.user2_email : chat.user1_email
        let recipient = await User.findOne({ email: recipient_email })
        
        var newMessage = new Message({
            sender_id: sender._id,
            content: data.message
        })
        if (recipient.room == data.room) newMessage.seen = true
        newMessage.save()
        chat.messages.push(newMessage)
        chat.save()

        message = {
            content: newMessage.content,
            timestamp: newMessage.timestamp,
            seen: newMessage.seen
        }
        socket.to(data.room).emit('chat-message', {'message':message, 'alert': (message.seen ? false : true), 'image':sender.image})
    })

    socket.on('disconnect', () => {
        socket.to(Object.keys(socket.rooms)).emit('recipient-out')
        socket.leave(Object.keys(socket.rooms))
    })
})

server.listen(process.env.PORT || 5000)

module.exports = { app, server, io }