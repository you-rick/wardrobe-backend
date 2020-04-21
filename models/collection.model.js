const mongoose = require('mongoose');


let CollectionSchema = new mongoose.Schema({
    title: {type: String},
    photo: {type: String},
    type: {type: String},
    weather: {type: String},
    items: [{
        type: String
    }],
    userId: {type: String}
});

let Collection = mongoose.model('Collection', CollectionSchema);


module.exports = {
    Collection: Collection
};
