const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: 'Full name can not be empty'
    },
    email: {
        type: String,
        required: 'Email can not be empty',
        unique: true
    },
    password: {
        type: String,
        required: 'Password can not be empty',
        minlength : [4, 'Password must be at least 4 character long']
    },
    saltSecret: String
});


// Custom validation for email
userSchema.path('email').validate((val) => {
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Предварительная проверка перед save
userSchema.pre('save', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            next();
        });
    });
});


// Методы
// Проверяем если из формы логирования пришел верный пароль
userSchema.methods.verifyPassword = (password, hash) => {
    return bcrypt.compareSync(password, hash);
};

userSchema.methods.generateJwt = (userId) => {
    return jwt.sign({ "_id": userId},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXP
        });
};

let User = mongoose.model('User', userSchema);

module.exports = {
    User: User
};
