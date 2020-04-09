const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

// Параметры в options - консоль предложила их добавить при первом подключении
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, },
    (err) => {
    if (!err) {
        console.log('Yey! MongoDB connection works well!!!');
    } else {
        console.log('Fuck! DB error connection:' + JSON.stringify(err, undefined, 2));
    }
});


// Так как нам нужно, чтоб подключение работало не только в этом файле - экспортируем подключение

module.exports = mongoose;

