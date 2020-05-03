const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const jwtHelper = require('../config/jwtHelper');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const _ = require('lodash');

let router = express.Router();
let {User} = require('../models/user.model');
let {Token} = require('../models/token.model');


router.post('/register', (req, res, next) => {
    let user = new User({
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
                    return res.status(500).json({message: err.message});
                }

                let options = {
                    auth: {
                        api_user: process.env.SENDGRID_USERNAME,
                        api_key: process.env.SENDGRID_PASSWORD
                    }
                };

                let transporter = nodemailer.createTransport(sgTransport(options));
                let email = {
                    from: 'info@frontend-developer.ru',
                    to: user.email,
                    subject: 'Wardrobe Online. Account Verification',
                    html: '<p>Hello,\n\n' + 'Please verify your account by clicking <a href="http:\/\/localhost:4200\/email-confirmation\/' + token.token + '">This link</a></p>'
                };

                transporter.sendMail(email, err => {
                    if (err) {
                        console.log("FUCK!", err);
                    } else {
                        res.status(200).json({message: 'A verification email has been sent to ' + user.email + '.'});
                    }
                });
            });


        } else {
            if (err.code === 11000) {
                res.status(422).json({message: 'Duplicate email address found.'});
            } else {
                return next(err);
            }
        }
    });
});

router.post('/email-confirmation', (req, res) => {
    let userToken = req.body.token;

    if (!userToken) return res.status(400).json({
        message: 'Token was not provided'
    });

    Token.findOne({token: userToken}, (err, token) => {
        if (!token) return res.status(400).send({message: 'We were unable to find a valid token. Your token can have expired.'});

        User.findOne({_id: token._userId}, (err, user) => {
            if (!user) return res.status(400).send({message: 'We were unable to find a user for this token.'});
            if (user.isVerified) return res.status(400).json({message: 'This user has already been verified.'});

            // Verify and save the user
            user.isVerified = true;
            user.save(function (err, docs) {
                if (!err) {
                    res.status(200).send(_.pick(user, ['fullName', 'email', 'isVerified']));
                } else {
                    res.status(500).json({message: err.message});
                }

            });
        });
    });
});

router.post('/authenticate', (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(400).json(err);
        } else if (user) {
            if (!user.isVerified) return res.status(400).json({message: 'Email is not verified'});

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
            return res.json({message: 'Email is not verified'});
        } else {
            // Чтоб не отдавать все данные о пользователе, то есть пароль и салт, используем
            // Lodash как фильтр
            return res.status(200).json({status: true, user: _.pick(user, ['fullName', 'email'])});
        }
    });
});


module.exports = router;
