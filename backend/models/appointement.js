var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var appointmentSchema = new Schema({
    docId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hospId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },    
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    date: {
        type: Number,
        required: true
    },
    start:  {
        type: Number,
        required: true
    },
    end:  {
        type: Number,
        required: true
    },    
    reason: {
        type: String,
        required: true
    },
    symptom: String,
    diagnosis: String,
    prescription: String    
}, {
    timestamps: true
});

module.exports = mongoose.model('Appointement', appointmentSchema);

