const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const messageSchema = require('../models/message').schema

var chatSchema = mongoose.Schema({
    salt: {
        type: String
    },
    user1_email : {
        type: String,
        required: true,
    },
    user2_email : {
        type: String,
        required: true,
    },
    messages : [messageSchema],
    
}, {timestamps: true})

chatSchema.methods.setSalt = function() {
    bcrypt.genSalt(10, function(err, salt){
        if (err) {
            console.log(err)
        } else 
            this.salt = salt
    })
}

module.exports = mongoose.model('Chat', chatSchema)
