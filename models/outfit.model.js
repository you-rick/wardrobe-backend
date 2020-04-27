const mongoose = require('mongoose');


let OutfitSchema = new mongoose.Schema({
    title: {type: String},
    type: {type: String},
    weather: [{
        type: String
    }],
    items: [{
        type: String
    }],
    dates: [{
        type: String
    }],
    userId: {type: String}
});

let Outfit = mongoose.model('Outfit', OutfitSchema);


module.exports = {
    Outfit: Outfit
};
