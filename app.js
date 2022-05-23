var express = require('express');
var path = require('path');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var contenedoresRouter = require('./routes/contenedores');

var app = express();
const port = 3000

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use('/contenedor', contenedoresRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})