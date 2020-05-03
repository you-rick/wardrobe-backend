const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const jwtHelper = require('../config/jwtHelper');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const _ = require('lodash');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let router = express.Router();
let {User} = require('../models/user.model');
let {Token} = require('../models/token.model');


router.post('/register', (req, res, next) => {
    var user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password
    });

    user.save((err, doc) => {
        if (!err) {
            let token = new Token({
                _userId: user._id,
                token: crypto.randomBytes(16).toString('hex')
            });
            // Save the verification token
            token.save(function (err) {
                if (err) {
                    return res.status(500).send({msg: err.message});
                }

                let options = {
                    auth: {
                        api_user: process.env.SENDGRID_USERNAME,
                        api_key: process.env.SENDGRID_PASSWORD
                    }
                };

                let client = nodemailer.createTransport(sgTransport(options));
                let email = {
                    from: 'fanat-classik@mail.ru',
                    to: user.email,
                    subject: 'Hello',
                    text: 'Hello world',
                    html: '<b>Hello world</b>'
                };

                client.sendMail(email, function (err, info) {
                    if (err) {
                        console.log("FUCK!", err);
                    } else {
                        console.log('Message sent!');
                    }
                });
            });


        } else {
            if (err.code === 11000) {
                res.status(422).send(['Duplicate email adrress found.']);
            } else {
                return next(err);
            }
        }
    });
});


router.post('/authenticate', (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(400).json(err);
        } else if (user) {
            return res.status(200).json({'token': user.generateJwt(user._id)});
        }
        // unknown user or wrong password
        else {
            return res.status(404).json(info);
        }
    })(req, res, next);
});

router.get('/user-profile', jwtHelper.verifyJwtToken, (req, res, next) => {
    User.findOne({_id: req._id}, (err, user) => {
        if (!user) {
            return res.status(404).json({status: false, message: 'User record not found'});
        } else if (!user.isVerified) {
            return res.send({message: 'Email is not verified'});
        } else {
            // Чтоб не отдавать все данные о пользователе, то есть пароль и салт, используем
            // Lodash как фильтр
            return res.status(200).json({status: true, user: _.pick(user, ['fullName', 'email'])});
        }
    });
});


module.exports = router;
