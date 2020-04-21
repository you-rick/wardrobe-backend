const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');

// Cкобки нужны для Object destructuring. Так как в db.js мы сделали export - тут мы должны обнять переменную скобками.
const {config} = require('./config/config');
const {mongoose} = require('./db');
const {passportConfig} = require('./config/passportConfig');


var itemController = require('./controllers/itemController');
var userController = require('./controllers/userController');
var collectionController = require('./controllers/collectionController');

var app = express();
// первый аргумент - чтоб сохранить /uploads в URL, второй - все внутри сделать доступным по ссылке (картинки)
app.use('/uploads', express.static('uploads'));
// added Limit, because base64 image had problems
app.use(bodyParser.json({limit: '20mb'}));
//Для решения проблемы Cross-Origin
app.use(cors({origin: 'http://localhost:4200'}));
app.use(passport.initialize());


app.listen(process.env.PORT, () => console.log(`Server started at port : ${process.env.PORT}`));


app.use('/items', itemController);
app.use('/collections', collectionController);
app.use('/api', userController);



// Error Handler должен быть в самом вконце, после всех подключений
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    }
});
