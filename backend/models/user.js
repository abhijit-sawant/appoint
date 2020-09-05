var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username: String,
    password: String,
    hospIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'     
    }],    
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    phoneno: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: ''
    }
});

UserSchema.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};
UserSchema.index({firstname:'text', lastname: 'text', phoneno: 'text', email: 'text'})
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
