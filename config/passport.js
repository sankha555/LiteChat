const mongoose = require('mongoose')
const User = mongoose.model('User')
const LocalStrategy = require('passport-local').Strategy
const bcryptjs = require('bcryptjs')
const GoogleStrategy = require('passport-google-oauth2').Strategy

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'user[email]' }, function (email, password, done) {

        let query = { email: email }
        User.findOne(query, function (err, user) {
            if (err) {
                throw err
            }

            if (!user) {
                return done(null, false, { message: 'No user found' });
            }

            // Match Password
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) {
                    throw err
                }
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Wrong password' });
                }
            })
        })
    }))


    passport.serializeUser(function (user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user)
        })
    })

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "https://litechat-im.herokuapp.com/auth/google/callback",
        passReqToCallback: true
    },
        function (request, accessToken, refreshToken, profile, done) {
            User.findOne({
                'googleId': profile.id
            }, function (err, user) {
                if (err) {
                    return done(err);
                }

                console.log(profile)
                
                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails ? profile.emails[0].value : profile.id,
                        googleId: profile.id,
                        image: profile.picture
                    })
                    user.save(function (err) {
                        if (err)
                            console.log(err)
                        return done(err, user)
                    })
                } else {
                    return done(err, user)
                }
            })
        }
    ))
}



