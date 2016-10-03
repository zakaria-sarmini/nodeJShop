var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;


var users = new Schema({
   email: {type: String, required: true},
   password: {type: String, required: true},
   admin: {type: Boolean, default: false}
});

users.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

users.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Users', users);