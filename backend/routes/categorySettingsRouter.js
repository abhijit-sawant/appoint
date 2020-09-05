var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var settings = require('../models/settings');
var Verify = require('./verify')

var categorySettingRouter = express.Router();
categorySettingRouter.use(bodyParser.json());

categorySettingRouter.route('/')
.get(Verify.verifyUser, function (req, res, next) {
    settings.CategorySettings.find({'userId': req.query.userId, 'hospId': req.query.hospId})
        .exec(function (err, categorySetting) {
            if (err) return res.json({ msg: err });
            res.json(categorySetting);
    });
})

.post(Verify.verifyUser, function (req, res, next) {
    newCategory = req.body;
    newCategory.userId = req.query.userId;
    newCategory.hospId = req.query.hospId;
    settings.CategorySettings.create(newCategory, function (err, category) {
        if (err) return res.json({ msg: err });
        res.json(category);
    });	
})

categorySettingRouter.route('/:id')
.delete(Verify.verifyUser, function (req, res, next) {
	    settings.CategorySettings.findOne({'_id': req.params.id})
        .exec(function (err, category) {
            if (err) return res.json({ msg: err });
            if (category !== null)
            {
                category.remove();
                return res.json(category);
            }
            else
                return res.status(500).json({msg: 'No matching category found'});
    });
})

module.exports = categorySettingRouter;
