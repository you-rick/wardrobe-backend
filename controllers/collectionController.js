const express = require('express');
let router = express.Router();
// Для того, чтоб проверять если id валидный для MongoDB
let ObjectId = require('mongoose').Types.ObjectId;
// file manager
const fs = require('fs');
// MIME type
const mime = require('mime');
const jwtHelper = require('../config/jwtHelper');
const uploadHelper = require('../config/imageUpload');



let {Item} = require('../models/item.model');
let {Collection} = require('../models/collection.model');

router.get('/', jwtHelper.verifyJwtToken, (req, response) => {
    Collection.find({'userId': req._id}, (err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Fuck! Error in Retrieving Collections :" + JSON.stringify(err, undefined, 2));
        }
    });
});

router.get('/:id', (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Collection.findById(req.params.id, (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
            console.log("Fuck! Error in Retrieving Collection by ID :" + JSON.stringify(err, undefined, 2));
        }
    });
});

router.post('/', jwtHelper.verifyJwtToken, uploadHelper.uploadImage, (req, response) => {
    console.log("sdfsfsdfsdf");

    let coll = new Collection({
        title: req.body.title,
        photo: req.body.photo || "",
        type: req.body.type,
        weather: req.body.weather,
        items: req.body.items,
        userId: req._id
    });

    coll.save((err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Fuck! Error in Collection POST :" + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;
