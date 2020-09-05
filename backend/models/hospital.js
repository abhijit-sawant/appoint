var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    name:  {
        type: String,
        required: true
    },
    adminIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'     
    }],    
    docIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'     
    }],   
    assistIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'     
    }],
    address_line_1: {
        type: String,
        required: true
    },
    address_line_2: String,
    city: {
        type: String,
        required: true
    },
    zip: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);
