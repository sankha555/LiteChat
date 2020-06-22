const express = require('express')
const router = express.Router()
const passport = require('passport')
const bcrypt = require('bcryptjs')

const User = require('../models/user')

router.get('/register', (req, res) => {
    if (req.user)
        return res.redirect('/')
    res.render('chats/register')
})

router.post('/register', (req, res) => {
    if (req.user)
        return res.redirect('/')
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    let newUser = new User({
        name: name,
        email: email,
        //username: username,
        password: password
    })

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err) {
                console.log(err)
            }
            newUser.password = hash
            newUser.save(function (err) {
                if (err) {
                    console.log(err)
                    return
                } else {
                    //console.log('Registration Successful')
                    res.redirect('/users/login')
                }

            })
        })
    })
})

router.get('/login', (req, res) => {
    if (req.user)
        return res.redirect('/')
    res.render('chats/login')
})

router.post('/login', (req, res, next) => {
    if (req.user)
        return res.redirect('/')
    //console.log('in login')
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', function (req, res) {
    req.logout()
    req.flash('success', 'You are logged out')
    res.redirect('/')
})

module.exports = router