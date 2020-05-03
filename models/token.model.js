const mongoose = require('mongoose');

let tokenSchema = new mongoose.Schema({
    _userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    token: {type: String, required: true},
    createdAt: {type: Date, required: true, default: Date.now, expires: 43200}
});

let Token = mongoose.model('Token', tokenSchema);

module.exports = {
    Token: Token
};
