var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var settings = require('../models/settings');
var Verify = require('./verify')

var weekSettingRouter = express.Router();
weekSettingRouter.use(bodyParser.json());

weekSettingRouter.route('/')
.get(Verify.verifyUser, function (req, res, next) {
    settings.WeekSettings.findOne({'userId': req.query.userId, 'hospId': req.query.hospId})
        .exec(function (err, weekSetting) {
            if (err) return res.json({ msg: err });
            res.json(weekSetting);
    });
})

weekSettingRouter.route('/:index')
.get(Verify.verifyUser, function (req, res, next) {
    settings.WeekSettings.findOne({'userId': req.query.userId, 'hospId': req.query.hospId})
        .exec(function (err, weekSetting) {
            if (err) return res.json({ msg: err });
            day = null;
            for (var i = 0; i < weekSetting.days.length; ++i) {
                if (weekSetting.days[i].index == req.params.index) {
                    day = weekSetting.days[i];
                    break;                
                }
            }
            if (day == null) return res.json({ err: "Day not found " + req.params.index });

            return res.json(day);
    });
})

weekSettingRouter.route('/:index/timeslots')
.post(Verify.verifyUser, function (req, res, next) {
    settings.WeekSettings.findOne({'userId': req.query.userId, 'hospId': req.query.hospId})
        .exec(function (err, weekSetting) {
            if (err) return res.json({ msg: err });
            index = null;
            for (var i = 0; i < weekSetting.days.length; ++i) {
                if (weekSetting.days[i].index == req.params.index) {
                    day = weekSetting.days[i];
                    index = i;
                    break;
                }
            }
            if (index == null) return res.json({ err: "Day not found " + req.params.index });

            weekSetting.days[index].timeSlots.push(req.body);
            weekSetting.save(function (err, weekSetting) {
                if (err) return res.json({ msg: err });
                var lastIndex = weekSetting.days[index].timeSlots.length - 1;
                return res.json(weekSetting.days[index].timeSlots[lastIndex]);
            });        
    });
})

weekSettingRouter.route('/:index/timeslots/:timeslotId')

.get(Verify.verifyUser, function (req, res, next) {
    settings.WeekSettings.findOne({'userId': req.query.userId, 'hospId': req.query.hospId})
        .exec(function (err, weekSetting) {
            if (err) return res.json({ msg: err });
            day = null;
            for (var i = 0; i < weekSetting.days.length; ++i) {
                if (weekSetting.days[i].index == req.params.index) {
                    day = weekSetting.days[i];
                    break;                
                }
            } 
            if (day == null) return res.json({ err: "Day not found " + req.params.index });

            return res.json(day.timeSlots.id(req.params.timeslotId));       
    });
})

.put(Verify.verifyUser, function (req, res, next) {
    settings.WeekSettings.findOne({'userId': req.query.userId, 'hospId': req.query.hospId})
        .exec(function (err, weekSetting) {
            if (err) return res.json({ msg: err });
            day = null;
            for (var i = 0; i < weekSetting.days.length; ++i) {
                if (weekSetting.days[i].index == req.params.index) {
                    day = weekSetting.days[i];
                    break;
                }
            }
            if (day == null) return res.json({ err: "Day not found " + req.params.index });

            slot = day.timeSlots.id(req.params.timeslotId);
            if (slot == null) return res.json({ msg: "Time slot not found " + req.params.timeslotId });

            slot.start = req.body.start;
            slot.end = req.body.end;
            weekSetting.save(function (err, weekSetting) {
                if (err) return res.json({ msg: err });
                return res.json(slot);
            });         
    });
})

.delete(Verify.verifyUser, function (req, res, next) {
    settings.WeekSettings.findOne({'userId': req.query.userId, 'hospId': req.query.hospId})
        .exec(function (err, weekSetting) {
        if (err) return res.json({ msg: err });
        day = null;
        for (var i = 0; i < weekSetting.days.length; ++i) {
            if (weekSetting.days[i].index == req.params.index) {
                day = weekSetting.days[i];
                break;
            }
        }
        if (day == null) return res.json({ err: "Day not found " + req.params.index });

        slot = weekSetting.days[i].timeSlots.id(req.params.timeslotId);
        if (slot == null) return res.json({ msg: "Time slot not found " + req.params.timeslotId });

        slot.remove();
        weekSetting.save(function (err, weekSetting) {
            if (err) return res.json({ msg: err });
            return res.json(day);
        });        
    });
});

module.exports = weekSettingRouter;
