const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

var messageSchema = mongoose.Schema({
    sender_id: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    seen: {
        type: Boolean,
        default: false
    },
    content: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: false
    }

})

messageSchema.methods.hashMessage = function (content) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(content, salt, function (err, hash) {
            if (err) {
                console.log(err)
            }
            this.hash = hash
        })
    })
}

module.exports = mongoose.model('Message', messageSchema)