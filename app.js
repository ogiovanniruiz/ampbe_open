var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

process.env.version = "3.8.0"

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
}

if (!process.env.jwtSecret) {
  console.error('jwtSecret is not set; refusing to start')
  process.exit(1)
}

var router = require('./routes/createRouter.js')
var requireAuth = require('./middleware/requireAuth.js')
var mediaRouter = require('./routes/media/getTextImage.js')

var app = express();

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
// Express 5 leaves req.body undefined when there is no body; handlers expect {}
app.use((req, res, next) => { req.body ??= {}; next() });
var mongoose = require('mongoose');
mongoose.set('autoCreate', false);

var mongoDB = process.env.mongoDB
var corsOptions = { 
                    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
                    optionsSuccessStatus: 200,
                    origin: process.env.fe
                  }

const connect = () =>{
  mongoose.connect(mongoDB);
  mongoose.Promise = global.Promise;
}

connect();

mongoose.connection.on('error', err =>{
    console.error.bind(console, `MongoDB connection: ${err}`)
    setTimeout(connect, 500)
  }
);

mongoose.connection.on('disconnected', err =>{
  console.error.bind(console, `MongoDB connection error: ${err}`)
  setTimeout(connect, 500)
});

const cors = require('cors');

app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/media', mediaRouter)
app.use('/api', requireAuth, router)

module.exports = app;