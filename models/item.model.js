const mongoose = require('mongoose');


let ItemSchema = new mongoose.Schema({
    title: {type: String},
    photo: {type: String},
    userId: {type: String}
});

let Item = mongoose.model('Item', ItemSchema);


module.exports = {
    Item: Item
};
