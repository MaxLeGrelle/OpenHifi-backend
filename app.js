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
var albumsRouter = require('./routes/albums');

var app = express();

app.use(logger('dev'));
//fix payload to large when receiving base64 image/audio
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());


app.use('/api/', cors(corsOptions), indexRouter);
app.use('/api/users', cors(corsOptions),usersRouter);
app.use('/api/musics', cors(corsOptions),musicsRouter);
app.use('/api/albums', cors(corsOptions),albumsRouter);

module.exports = app;
