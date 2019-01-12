const express = require('express');
const app = express();
const cron = require('node-cron');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes/router');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const helmet = require('helmet'); 
const {errorHandler} = require('./lib/data.helpers');
const DB_URL = process.env.MONGODB_URI;
const config = require('./config/config');
 
// connect to MongoDB
mongoose.connect(config.LOCAL_DB_URL, { useNewUrlParser: true });
// file upload
app.use(fileUpload());
// use cors and helmet
app.use(cors());
app.use(helmet());
app.use(cookieParser());
// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// serve static files from template
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({ 
    secret: config.secret,
    resave: true,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// include routes 
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

 
// define as the last app.use callback
// catch all error handler - any 500 errors
app.use(errorHandler);

// connect to app
const port = process.env.PORT || 3001;
app.listen(port, function () {
        console.log('App listening on port...' + port);    
});
