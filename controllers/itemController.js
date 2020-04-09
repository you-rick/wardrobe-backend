const express = require('express');
let router = express.Router();
// Для того, чтоб проверять если id валидный для MongoDB
let ObjectId = require('mongoose').Types.ObjectId;
// Для обработки медиа файлов
const multer = require('multer');

// Настройки - куда отправится и имя файла
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, new Date().toISOString() + file.originalname);
    }
});

// Фильтр для обработки входной картинки
const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        //null - вместо него может быть сообщение об ошибке
        callback(null, true);
    } else {
        callback(new Error("HUI tebe, a ne file upload!"), false);
    }
}

// в опциях - папка, в которой multer будет сохранять картинки, максимальный размер и так далее (сейчас макс 2мб)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 1024 * 1024 * 2}

});

let {Item} = require('../models/item.model');


// -> localhost:3000/employees/ <- это описано в index.js. если изменить get параметр ниже на /bla, то рут получится
// localhost:3000/employees/bla

router.get('/', (req, response) => {
    Item.find((err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Fuck! Error in Retrieving Items :" + JSON.stringify(err, undefined, 2));
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

router.post('/', upload.single('itemPhoto'), (req, response) => {
    console.log(req.file);
    let itm = new Item({
        title: req.body.title,
        photo: req.file.path
    });

    itm.save((err, docs) => {
        if (!err) {
            response.send(docs);
        } else {
            console.log("Fuck! Error in Item POST :" + JSON.stringify(err, undefined, 2));
        }
    });
});


router.put('/:id', (req, response) => {  // /:id <- это то, к чему можно будет стучаться через req.params.id
    if (!ObjectId.isValid(req.params.id)) {
        return response.status(400).send(`No record with given id: ${req.params.id}`);
    }

    let itm = {
        title: req.body.title,
        photo: req.file.path
    };

    // {new: true} -
    Item.findByIdAndUpdate(req.params.id, {$set: itm}, {new: true, useFindAndModify: false}, (err, doc) => {
        if (!err) {
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
            response.send(doc);
        } else {
            console.log("Fuck! Error in Item DELETE :" + JSON.stringify(err, undefined, 2));
        }
    });
});

module.exports = router;
