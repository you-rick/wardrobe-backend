const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const jwtHelper = require('../config/jwtHelper');
const _ = require('lodash');


let router = express.Router();
let {User} = require('../models/user.model');


router.get('/', (req, res) => {
    User.find((err, docs) => {
        if (!err) {
            res.send(docs);
        } else {
            console.log("Fuck! Error in Retrieving Users :" + JSON.stringify(err, undefined, 2));
        }
    });
});



router.post('/register', (req, res, next) => {
    var user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password
    });

    user.save((err, doc) => {
        if (!err)
            res.send(doc);
        else {
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


//  verifyJwtToken - Middleware функция, которая декодирует токен, чтоб получить данные с сервера
router.get('/user-profile', jwtHelper.verifyJwtToken, (req, res, next) => {
    User.findOne({ _id: req._id }, (err, user) => {
        if (!user) {
            return res.status(404).json({ status: false, message: 'User record not found' });
        } else {
            // Чтоб не отдавать все данные о пользователе, то есть пароль и салт, используем
            // Lodash как фильтр
            return res.status(200).json({ status: true, user: _.pick(user,  ['fullName', 'email']) });
        }
    });
});



module.exports = router;
