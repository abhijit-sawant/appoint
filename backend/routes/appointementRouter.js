var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Appointement = require('../models/appointement');
var Verify = require('./verify')

var appointementRouter = express.Router();
appointementRouter.use(bodyParser.json());

appointementRouter.route('/')
.get(Verify.verifyUser, function (req, res, next) {
    Appointement.find({'docId': req.query.docId, 'hospId': req.query.hospId})
        .populate('patientId')
        .exec(function (err, appointements) {
            if (err) return res.json({ msg: err });
            res.json(appointements);
    });
})

.post(Verify.verifyUser, function (req, res, next) {
    newAppointement = req.body;
    Appointement.create(newAppointement, function (err, appointement) {
        if (err) return res.json({ msg: err });
        res.json(appointement);
    });	
})

appointementRouter.route('/date')
.get(Verify.verifyUser, function (req, res, next) {
    Appointement.find({'docId': req.query.docId, 'hospId': req.query.hospId, 
                       'month': parseInt(req.query.month), 'year': parseInt(req.query.year),
                       'date': parseInt(req.query.date)})
        .populate('patientId')
        .exec(function (err, appointements) {
            if (err) return res.status(500).json({ msg: err });
            res.json(appointements);
    });
})

appointementRouter.route('/days')
.get(Verify.verifyUser, function(req, res, next) {
    var dates = [];
    for (var i = 0; i < req.query.day.length; ++i) {
        dates.push(new Date(parseInt(req.query.day[i])));
    }

    var appoints = [];
    getAppointments(0, req.query.docId, req.query.hospId, dates, appoints, function(err, appoints) {
        if (err)  {
            return res.json({ msg: err });
        }
        res.json(appoints);
    }); 
})

appointementRouter.route('/week')
.get(Verify.verifyUser, function(req, res, next) {
    var month = parseInt(req.query.month);
    var year = parseInt(req.query.year);
    var date = parseInt(req.query.date);
    var weekDate = new Date(year, month, date);
    var monthDateLast = new Date(weekDate.getFullYear(), weekDate.getMonth() + 1, 0);
    
    var first = weekDate.getDate() - weekDate.getDay();
    var last = first;
    var dates = [];
    for (var i = 0; i < 7; ++i) {
        var tempDate = null;
        if (last > monthDateLast.getDate()) {
            var diff =  last - monthDateLast.getDate();
            if (weekDate.getMonth() == 11)
                tempDate = new Date(weekDate.getFullYear() + 1, 0, diff);
            else
                tempDate = new Date(weekDate.getFullYear(), weekDate.getMonth() + 1, diff);

        }
        else
            tempDate = new Date(weekDate.setDate(last));

        dates.push(tempDate);
        last = last + 1;
    }

    var appoints = [];
    getAppointments(0, req.query.docId, req.query.hospId, dates, appoints, function(err, appoints) {
        if (err) return res.json({ msg: err });
        res.json(appoints);
    });            
});

appointementRouter.route('/num_appoints_days')
.get(Verify.verifyUser, function(req, res, next) {
    var dates = [];
    for (var i = 0; i < req.query.day.length; ++i) {
        dates.push(new Date(parseInt(req.query.day[i])));
    }

    var appoints = [];
    getAppointments(0, req.query.docId, req.query.hospId, dates, appoints, function(err, appointements) {
        if (err)  {
            return res.json({ msg: err });
        }
        var numAppoints = [];
        for (var i = 0; i < appointements.length; ++i) {
            numAppoints.push(appointements[i].data.length);
        }
        res.json(numAppoints);
    }); 
})

appointementRouter.route('/num_appoints_month')
.get(Verify.verifyUser, function (req, res, next) {
    Appointement.find({'docId': req.query.docId, 'hospId': req.query.hospId, 
                       'month': parseInt(req.query.month), 'year': parseInt(req.query.year)})
        .sort({ date: 1 })
        .exec(function (err, appointements) {
            if (err) return res.json({ msg: err });

            var count = 0;
            var numAppoints = [];
            for (var i = 1; i <= 31; ++i) {
                var temp = 0;
                for (var j = count; j < appointements.length; ++j) {
                    if (appointements[j].date == i) {
                        temp = temp + 1;
                        count = count + 1;
                    }
                    else
                        break;
                }
                numAppoints.push(temp);
            }
            res.json(numAppoints);
    });
})

appointementRouter.route('/num_appoints_year')
.get(Verify.verifyUser, function (req, res, next) {
    Appointement.find({'docId': req.query.docId, 'hospId': req.query.hospId, 
                       'year': parseInt(req.query.year)})
        .sort({ month: 1 })
        .exec(function (err, appointements) {
            if (err) return res.json({ msg: err });

            var count = 0;
            var numAppoints = [];
            for (var i = 0; i < 12; ++i) {
                var temp = 0;
                for (var j = count; j < appointements.length; ++j) {
                    if (appointements[j].month == i) {
                        temp = temp + 1;
                        count = count + 1;
                    }
                    else
                        break;
                }
                numAppoints.push(temp);
            }
            res.json(numAppoints);
    });
})

appointementRouter.route('/:id')
.delete(Verify.verifyUser, function (req, res, next) {
	    Appointement.findOne({'docId': req.query.docId, 'hospId': req.query.hospId, '_id': req.params.id})
        .exec(function (err, appointement) {
            if (err) return res.json({ msg: err });
            appointement.remove();
            res.json(appointement);
    });
})

.put(Verify.verifyUser, function (req, res, next) {
        Appointement.findByIdAndUpdate(
            {'docId': req.query.docId, 'hospId': req.query.hospId, '_id': req.params.id},
            {$set: req.body},
            {new: true})
        .populate('patientId')
        .exec(function (err, appointement) {
            if (err) return res.status(500).json({ msg: err });
            res.json(appointement);
        });
})

var getAppointments = function(i, docId, hospId, weekDates, appoints, callback) {
    if (i < weekDates.length) {
        Appointement.find({'docId': docId, 'hospId': hospId, 
                           'month': weekDates[i].getMonth(), 'year': weekDates[i].getFullYear(),
                           'date': weekDates[i].getDate()})
            .populate('patientId')
            .exec(function (err, appointsDay) {
                if (err) callback(err, appoints);

                appoints.push({'data': appointsDay});
                i = i + 1;
                getAppointments(i, docId, hospId, weekDates, appoints, callback);
            });
    }
    else {
        return callback(null, appoints);
    }
}

module.exports = appointementRouter;
