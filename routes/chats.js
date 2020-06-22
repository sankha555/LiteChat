const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/user')
const Chat = require('../models/chat')
const Message = require('../models/message')

router.get('/new', async(req, res) => {
    let chats1 = await Chat.find({ user1_email: req.user.email })
    let chats2 = await Chat.find({ user2_email: req.user.email })
    let chats = chats1.concat(chats2)
    //console.log(chats)
    res.render('chats/menu', {'chats':chats})
})

router.get('/all', async(req, res) => {
    res.render('chats/list', { 'chats': await Chat.find().sort({ date_created: 'created_at' }) })
})

router.post('/', async(req, res, next) => {
    if (req.body.email == req.user.email)
        res.redirect('chats/new')
    let recipient = await User.findOne({email: req.body.email})
    if (recipient) {
        let chat = await Chat.findOne({ user1_email: req.user.email, user2_email: recipient.email })
        if (!chat)
            chat = await Chat.findOne({ user1_email: recipient.email, user2_email: req.user.email })
        
        req.is_new = false
        if (!chat) {
            chat = new Chat()
            req.is_new = true
        }
        req.recipient_email = recipient.email
        req.chat = chat
        return next()

    } else {
        res.redirect('/chats/new')
    }
}, gotonext())

function gotonext() {
    return async (req, res) => {

        let chat = req.chat
        if (req.is_new) {
            chat.user1_email = req.user.email
            chat.user2_email = req.recipient_email
        }
        await chat.save()

        let up_user = {}
        up_user = {
            room: chat._id
        }

        User.updateOne({ _id: req.user._id }, up_user, function (err) {
            if (err) {
                console.log('in err')
                console.log(err)
            } else {
                console.log('passed')
            }
        })

        try {
            res.redirect(`/chats/${chat._id}`)
        } catch {
            res.redirect('/all')
        }
    }
}

router.get('/:id', async(req, res) => {

    let chat = await Chat.findById(req.params.id)
    if (chat) {
        let user1 = await User.findOne({email: chat.user1_email})
        let user2 = await User.findOne({email: chat.user2_email})

        let data = {}

        //console.log(req.user)
        if (chat.user1_email === req.user.email) {
            //console.log('here at 78')
            data = {
                'recipient_name' : user2.name,
                'recipient' : user2,
                'sender' : user1
            }

        } else if (chat.user2_email  === req.user.email){
            //console.log('here at 87')
            data = {
                'recipient_name': user1.name,
                'recipient': user1,
                'sender': user2
            }
        } else {
            //console.log('here at 95')
            return res.status(401).send()
        }

        let up_user = {}
        up_user = {
            room: chat._id
        }

        User.updateOne({ _id: req.user._id }, up_user, async(err) => {
            if (err) {
                //console.log('in err')
                console.log(err)
            } else {
                //console.log('here at 111')

                // Updating read status
                for(var i = 0; i < (chat.messages).length; i++){
                    if (((chat.messages)[i].seen != true) && ((chat.messages[i]).sender_id != req.user._id)){
                        
                        var message = await Message.findById((chat.messages)[i]._id)
                        message.seen = true
                        await message.save();

                        (chat.messages)[i] = message
                        await chat.save()
                        
                        //console.log((chat.messages)[i])
                    }
                }
                
                let chats1 = await Chat.find({ user1_email: req.user.email })
                let chats2 = await Chat.find({ user2_email: req.user.email })
                let chats = chats1.concat(chats2)

                data.messages = chat.messages
                data.chat = chat
                data.chats = chats

                if (chat.user1_email === req.user.email) {
                    if (user2.room === chat._id)
                        data.status = "Active"
                    else 
                        data.status = ""
                } else if (chat.user2_email === req.user.email) {
                    if (user1.room === chat._id)
                        data.status = "Active"
                    else
                        data.status = ""
                }
                               

                return res.render('chats/chat', data)
            }
        })
        
        //console.log('here at 104')
    } else {
        res.status(404).send()
    }
})

module.exports = router