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

router.put('/:id', jwtHelper.verifyJwtToken, uploadHelper.uploadImage, (req, response) => {  // /:id <- это то, к чему можно будет стучаться через req.params.id
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    let coll = {
        title: req.body.title,
        photo: req.body.photo || "",
        type: req.body.type,
        weather: req.body.weather,
        items: req.body.items,
        userId: req._id
    };

    Collection.findByIdAndUpdate(req.params.id, {$set: coll}, {new: false, useFindAndModify: false}, (err, doc) => {
        if (!err) {
            if (doc.photo.length) {
                fs.unlink("./" + doc.photo, function (err) {
                    if (err) throw err;
                    // if no error, file has been deleted successfully
                    console.log('File deleted!');
                });
            }
            response.send(doc);
        } else {
            console.log("Fuck! Error in Collection PUT :" + JSON.stringify(err, undefined, 2));
        }
    });
});

router.delete('/:id', (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Collection.findByIdAndRemove(req.params.id, {useFindAndModify: false}, (err, doc) => {
        if (!err) {
            if (doc.photo.length) {
                fs.unlink("./" + doc.photo, function (err) {
                    if (err) throw err;
                    // if no error, file has been deleted successfully
                    console.log('File deleted!');
                });
            }

            response.send(doc);
        } else {
            console.log("Fuck! Error in Collection DELETE :" + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;
