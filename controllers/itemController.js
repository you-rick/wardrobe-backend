const express = require('express');
let router = express.Router();
// Для того, чтоб проверять если id валидный для MongoDB
let ObjectId = require('mongoose').Types.ObjectId;
// file manager
const fs = require('fs');

const jwtHelper = require('../config/jwtHelper');
const uploadHelper = require('../config/imageUpload');


let {Item} = require('../models/item.model');


router.get('/', jwtHelper.verifyJwtToken, (req, response) => {
    // Get just list of items, if ids param provided
    if (req.query.ids) {

        let ids = req.query.ids;
        let obj_ids = ids.split(',');

        Item.find({_id: {$in: obj_ids}}, (err, docs) => {
            if (!err) {
                response.send(docs);
            } else {
                console.log("Fuck! Error in Retrieving Items by ID :" + JSON.stringify(err, undefined, 2));
            }
        });
    }
    // Send all items
    else {
        Item.find({'userId': req._id}, (err, docs) => {
            if (!err) {
                response.send(docs);
            } else {
                console.log("Fuck! Error in Retrieving Items :" + JSON.stringify(err, undefined, 2));
            }
        });
    }

});


router.get('/laundry', jwtHelper.verifyJwtToken, (req, response) => {
    Item.find({'washing': true}, (err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Fuck! Error in Retrieving Laundry :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.put('/laundry', jwtHelper.verifyJwtToken, (req, response) => {
    let itemList = req.query.ids ? req.query.ids.split(",") : [];
    let filterParam = itemList.length ? { _id: { $in: itemList } } : {};

    Item.updateMany(filterParam, {$set: {"washing": req.body.washing}}, (err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Fuck! Error in Updating Laundry :" + JSON.stringify(err, undefined, 2));
        }
    });

});


router.get('/:id', (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Item.findById(req.params.id, (err, doc) => {
        if (!err) {
            response.send(doc);
        } else {
            console.log("Fuck! Error in Retrieving Item by ID :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.post('/', jwtHelper.verifyJwtToken, uploadHelper.uploadImage, (req, response) => {

    let itm = new Item({
        title: req.body.title,
        photo: req.body.photo || "",
        type: req.body.type,
        weather: req.body.weather,
        washing: req.body.washing,
        userId: req._id
    });

    itm.save((err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Fuck! Error in Item POST :" + JSON.stringify(err, undefined, 2));
        }
    });
});

router.put('/:id', jwtHelper.verifyJwtToken, uploadHelper.uploadImage, (req, response) => {  // /:id <- это то, к чему можно будет стучаться через req.params.id
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    let itm = {
        title: req.body.title,
        photo: req.body.photo || "",
        type: req.body.type,
        weather: req.body.weather,
        washing: req.body.washing,
        userId: req._id
    };

    // {new: true} -
    Item.findByIdAndUpdate(req.params.id, {$set: itm}, {new: false, useFindAndModify: false}, (err, doc) => {
        if (!err) {
            fs.unlink("./" + doc.photo, function (err) {
                if (err) throw err;
                // if no error, file has been deleted successfully
                console.log('File deleted!');
            });
            console.log("updated file");
            response.send(doc);
        } else {
            console.log("Fuck! Error in Item PUT :" + JSON.stringify(err, undefined, 2));
        }
    });
});

router.delete('/:id', (req, response) => {
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    Item.findByIdAndRemove(req.params.id, {useFindAndModify: false}, (err, doc) => {
        if (!err) {
            fs.unlink("./" + doc.photo, function (err) {
                if (err) throw err;
                // if no error, file has been deleted successfully
                console.log('File deleted!');
            });
            response.send(doc);
        } else {
            console.log("Fuck! Error in Item DELETE :" + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;
