const express = require('express');
let router = express.Router();
// Для того, чтоб проверять если id валидный для MongoDB
let ObjectId = require('mongoose').Types.ObjectId;
const jwtHelper = require('../config/jwtHelper');


let {Item} = require('../models/item.model');
let {Outfit} = require('../models/outfit.model');


router.get('/', jwtHelper.verifyJwtToken, (req, response) => {
    if (req.query.id) {
         Outfit.find({'userId': req._id, 'items': req.query.id}, (err, docs) => {
            if (!err) {
                response.send(docs);
            } else {
                console.log("Fuck! Error in Retrieving Outfits by Item :" + JSON.stringify(err, undefined, 2));
            }
        });

    } else {
        Outfit.find({'userId': req._id}, (err, docs) => {
            if (!err) {
                response.send(docs);
            } else {
                console.log("Fuck! Error in Retrieving Outfits :" + JSON.stringify(err, undefined, 2));
            }
        });
    }
});


router.get('/:id', (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Outfit.findById(req.params.id, (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
            console.log("Fuck! Error in Retrieving Outfit by ID :" + JSON.stringify(err, undefined, 2));
        }
    });
});

router.post('/', jwtHelper.verifyJwtToken, (req, response) => {

    let outfit = new Outfit({
        title: req.body.title,
        type: req.body.type,
        weather: req.body.weather,
        items: req.body.items,
        dates: req.body.dates || "",
        userId: req._id
    });

    outfit.save((err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Fuck! Error in Outfit POST :" + JSON.stringify(err, undefined, 2));
        }
    });
});

router.put('/:id', jwtHelper.verifyJwtToken, (req, response) => {  // /:id <- это то, к чему можно будет стучаться через req.params.id
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    let outfit = {
        title: req.body.title,
        type: req.body.type,
        weather: req.body.weather,
        items: req.body.items,
        dates: req.body.dates || "",
        userId: req._id
    };

    Outfit.findByIdAndUpdate(req.params.id, {$set: outfit}, {new: false, useFindAndModify: false}, (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
            console.log("Fuck! Error in Outfit PUT :" + JSON.stringify(err, undefined, 2));
        }
    });
});

router.delete('/:id', (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Outfit.findByIdAndRemove(req.params.id, {useFindAndModify: false}, (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
            console.log("Fuck! Error in Outfit DELETE :" + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;
