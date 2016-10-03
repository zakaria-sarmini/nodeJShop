var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);


var mongooseUri = 'mongodb://YOUR-mLab-DATABASE-INFO';
mongoose.connect(mongooseUri);
require('./config/passport');
var userRoutes = require('./routes/users');
var routes = require('./routes/index');
var app = express();

// view engine setup
app.engine('.hbs', hbs({extname: '.hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(validator());
app.use(cookieParser());
app.use(session({
    secret: 'YOUR-SECRET',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.user = req.user;
    if(req.user){
        res.locals.admin = req.user.admin
    }
    next();
});
app.use('/', routes);
app.use('/users', userRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
