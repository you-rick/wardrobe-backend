const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');


let {User} = require('../models/user.model');

passport.use(
    // Меняем базовый тип логирования, по дефолту - username, а нас интересует поле email
    new LocalStrategy({usernameField: 'email'}, (username, password, done) => {
        // Для начала проверяем, если в системе есть такой юзер
        User.findOne({email: username}, (err, user) => {
           // console.log(user.password, password, '==============');

            if (err) {
                done(err);
            }
            // there is no this user in system
            else if (!user) {
                return done(null, false, {message: 'Email is not registered'});
            }
            // password is not correct
            else if (!user.verifyPassword(password, user.password)) {
                return done(null, false, {message: 'Password is not corrent'});
            }
            else {
                return done(null, user);
            }
        });
    })
);
