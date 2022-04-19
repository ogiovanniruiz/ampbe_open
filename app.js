var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var router = require('./routes/createRouter.js')

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
var mongoose = require('mongoose');

var mongoDB = ""
var corsOptions = { 
                    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
                    optionsSuccessStatus: 200,
                    origin: ""
                  }

process.env.version = "0.9.9.5i"

if(app.get('env') === 'development'){

  var localEnv = require('./localEnvironment');

  process.env.devMode = localEnv.devMode
  process.env.accountSid = localEnv.accountSid
  process.env.authToken = localEnv.authToken
  process.env.fe = localEnv.fe
  process.env.be = localEnv.be
  process.env.testTextingNumber = localEnv.testTextingNumber
  process.env.contactEmail = localEnv.contactEmail
  process.env.contactEmailPassword = localEnv.contactEmailPassword
  process.env.geocodioAPIKey = localEnv.geocodioAPIKey
  process.env.stripeAPIKey = localEnv.stripeAPIKey

  mongoDB = localEnv.mongoDB
  corsOptions.origin = localEnv.fe
  
}else{
  mongoDB = process.env.mongoDB
  corsOptions.origin = process.env.fe;
}

const connect = () =>{
  mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true});
  mongoose.Promise = global.Promise;
  mongoose.set('useCreateIndex', true);
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', router)

module.exports = app;