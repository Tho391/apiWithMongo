//grab the packages that we need for the user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
//use schema
var UserSchema = new Schema({
    name: String,
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true,
        select: false
    }
});
//hash the pass word before the user is saved
UserSchema.pre('save', function (next) {
    var user = this;
    //hass the pass only if the pass has been changed or user is new
    if (!user.isModified('password')) {
        return next();
    }
    //generate the hash
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) {
            return next(err);
        }
        //change the password to the hashed version
        user.password = hash;
        next();
    });


});
UserSchema.methods.comparePassword = function (password) {
    var user = this;
    return bcrypt.compareSync(password,user.password);
}
//return the model
module.exports = mongoose.model('User',UserSchema);