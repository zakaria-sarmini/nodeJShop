var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var Products = require('../models/products-schema');

var csrfProtection = csrf();
router.use(csrfProtection);


router.get('/profile', isLoggedIn, function (req, res, next) {
    res.render('users/profile', {title: 'profile'});
});

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.get('/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('users/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/users/signup',
    failureFlash: true
}), function(req, res, next){
    if(req.session.oldUrl){
        var url = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(url);
    }
    else{
        res.redirect('/users/profile');
    }
});


router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/users/signin',
    failureFlash: true
}), function(req, res, next){
    if(req.session.oldUrl){
        var url = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(url);
    }
    else{
        res.redirect('/users/profile');
    }
});

router.get('/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('users/signin', {
        title: 'sign in',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0
    })
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}