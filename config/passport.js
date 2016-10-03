var passport = require('passport');
var LocalStrategy = require('passport-local');
var Users = require('../models/user');

passport.serializeUser(function (user, done) {
    done(null, user.id)
});

passport.deserializeUser(function (id, done) {
    Users.findById(id, function (err, user) {
        done(err, user)
    })
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email','invalid email address').notEmpty().isEmail();
    req.checkBody('password', 'invalid password').notEmpty().isLength({min: 4});
    var errors = req.validationErrors();
    if (errors){
        var messages = [];
        errors.forEach(function(err){
            messages.push(err.msg);
        });
        return done(null, false, req.flash('error', messages))
    }
    Users.findOne({'email':email}, function(err, user){
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, {message:'email already exists'})
        }
        var newUser = new Users();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.admin = false;
        newUser.save(function(err, result){
            if(err){
                return done(err);
            }
            return done(null, newUser)
        });
    });

}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'invalid email address').notEmpty().isEmail();
    req.checkBody('password', 'invalid password').notEmpty();
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(err){
            messages.push(err.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    Users.findOne({'email':email}, function(err, user){
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'no user found'})
        }
        if(!user.validatePassword(password)){
            return done(null, false, {message: 'wrong password'})
        }
        return done(null, user);
    })
}));