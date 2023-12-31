const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const invoke = require('./api/routes/invoke');
const query = require('./api/routes/query');
const queryAll = require('./api/routes/queryAll');
const { application } = require('express');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT', 'POST', 'PATCH', 'DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use('/invoke', invoke);
app.use('/query', query);
app.use('/queryAll', queryAll);


app.use((req, res, next) => {
    const error = new Error('Not found!');
    error.status= 404;
    next(error);

});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }

    });

});

module.exports = app;