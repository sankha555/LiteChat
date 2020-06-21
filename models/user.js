const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

var userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String
    },
    googleId: {
        type: String
    },
    image: {
        type: String
    },
    room: {
        type: String,
        default: null
    }

}, { timestamps: true })

userSchema.methods.setPassword = function(password){
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                console.log(err)
            }
            this.password = hash
        })
    })
}

module.exports = mongoose.model('User', userSchema)
