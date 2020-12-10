var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

let corsOptions = {
    origin : 'http://localhost',
}

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var musicsRouter = require('./routes/musics');

var app = express();

app.use(logger('dev'));
app.use(express.json({limit:"1000mb"}));
app.use(express.urlencoded({ limit:"1000mb", extended: true }));
app.use(cookieParser());

app.use('/api/', cors(corsOptions), indexRouter);
app.use('/api/users', cors(corsOptions),usersRouter);
app.use('/api/musics', cors(corsOptions),musicsRouter);

module.exports = app;
