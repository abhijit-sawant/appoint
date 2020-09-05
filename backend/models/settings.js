var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var timeSlotSchema = new Schema({
    start:  {
        type: Number,
        required: true
    },
    end:  {
        type: Number,
        required: true
    },    
}, {
    timestamps: true
});

var daySettingSchema = new Schema({
    index: {
        type: Number,
        required: true
    },
    timeSlots:[timeSlotSchema]
}, {
    timestamps: true
});

var weekSettingsSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, 
    hospId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true        
    },   
    days:[daySettingSchema]
}, {
    timestamps: true
});
var WeekSettings = mongoose.model('WeekSetting', weekSettingsSchema);

var categorySettingsSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },  
    hospId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true        
    },     
    lable: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    }     
}, {
    timestamps: true
});
var CategorySettings = mongoose.model('CategorySetting', categorySettingsSchema);


module.exports = {
    WeekSettings: WeekSettings,
    CategorySettings: CategorySettings
};

