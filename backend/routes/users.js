var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = require('../models/user');
var Hospital = require('../models/hospital');
var settings = require('../models/settings');
var Verify    = require('./verify');

router.route('/info')
.get(Verify.verifyUser, function(req, res, next) {
    User.findOne({'_id': req.decoded._doc._id})
        .populate('hospIds')
        .exec(function (err, user) {
            if (err) return res.status(500).json({ msg: err});
            res.json(user);
        });
});

router.route('/info/:hospId')
.get(Verify.verifyUser, function(req, res, next) {
    Hospital.findOne({'_id': req.params.hospId})
        .exec(function (err, hosp) {
            if (err) return res.status(500).json({ msg: err});
            
            var isAdmin = false;
            for (var i = 0; i < hosp.adminIds.length; ++i) {
                if (hosp.adminIds[i] == req.decoded._doc._id) {
                    isAdmin = true;
                    break;
                }
            }

            var role = null;
            for (var i = 0; i < hosp.docIds.length; ++i) {
                if (hosp.docIds[i] == req.decoded._doc._id) {
                    role = 'doctor';
                    break;
                }
            }
            if (role === null)
            {
                for (var i = 0; i < hosp.assistIds.length; ++i) {
                    if (hosp.assistIds[i] == req.decoded._doc._id) {
                        role = 'assist';
                        break;
                    }
                }                
            }
            if (role === null)
                return res.status(500).json({ msg: 'User not found in hospital while finding role.'});

            res.json({'isAdmin': isAdmin, 'role': role});
        });
});

router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username, 
                             role: '',
                             firstname: req.body.firstname,
                             lastname: req.body.lastname,
                             phoneno: req.body.phoneno}),
        req.body.password, function(err, user) {
        if (err) 
            return res.status(500).json({ type: 'userExist', msg: err.message });

        if (req.body.email) 
            user.email = req.body.email;

        user.save(function(err,user) {
            if (err) return res.status(500).json({ msg: err});
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json(user);
            });
        });
    });
});

router.route('/add_user_to_hospital')
.post(Verify.verifyUser, function(req, res, next) {
    User.findOne({'_id': req.body.userId}).exec(function(err, user) {
        if (err) return res.status(500).json({ msg: err});
        Hospital.findOne({'_id': req.body.hospId}).exec(function(err, hosp) {
            if (err) return res.status(500).json({ msg: err});
            var isAdmin = false;
            for (var i = 0; i < hosp.adminIds.length; ++i) {
                if (hosp.adminIds[i] == req.decoded._doc._id) {
                    isAdmin = true;
                    break
                }
            }
            if (isAdmin === false) return res.status(500).json({ msg: 'You are not allowed to add user to hospital'});

            var userIds = hosp.docIds.concat(hosp.assistIds);
            var isUserPresent = false;
            for (var i = 0; i < userIds.length; ++i) {
                if (userIds[i] == req.body.userId) {
                    isUserPresent = true;
                    break;
                }
            }
            if (isUserPresent === true) return res.status(500).json({ msg: 'This user is already added to hospital'});

            if (req.body.role === 'doctor')
                hosp.docIds.push(req.body.userId);
            else if (req.body.role === 'assistant')
                hosp.assistIds.push(req.body.userId);
            else
                return res.status(500).json({ msg: 'The role provided is unknown ' + user.role });

            hosp.save(function(err, hosp) {
                if (err) return res.status(500).json({ msg: err});
                if (req.body.role === 'doctor') 
                    populateWeekSettings(req.body.userId, req.body.hospId);
                user.hospIds.push(req.body.hospId);
                user.save(function(err, user) {
                    if (err) return res.status(500).json({ msg: err});
                    return res.status(200).json(user);
                });                
            });        
        });
    });
});

router.route('/remove_user_from_hospital')
.delete(Verify.verifyUser, function(req, res, next) {
    User.findOne({'_id': req.query.userId}).exec(function(err, user) {
        if (err) return res.status(500).json({ msg: err});
        Hospital.findOne({'_id': req.query.hospId}).exec(function(err, hosp) {
            if (err) return res.status(500).json({ msg: err});
            var isAdmin = false;
            for (var i = 0; i < hosp.adminIds.length; ++i) {
                if (hosp.adminIds[i] == req.decoded._doc._id) {
                    isAdmin = true;
                    break
                }
            }
            if (isAdmin === false) return res.status(500).json({ msg: 'You are not allowed to remove user from hospital'});

            var arUser = null;
            if (req.query.role === 'doctor')
                arUser = hosp.docIds;
            else if (req.query.role === 'assistant')
                arUser = hosp.assistIds;
            else
                return res.status(500).json({ msg: 'The role provided is unknown ' + user.role });

            var isUserPresent = false;
            for (var i = 0; i < arUser.length; ++i) {
                if (arUser[i] == req.query.userId) {
                    arUser.splice(i, 1);
                    isUserPresent = true;
                    break;
                }
            }
            if (isUserPresent === false) return res.status(500).json({ msg: 'This user is not added to hospital'});

            hosp.save(function(err, hosp) {
                if (err) return res.status(500).json({ msg: err});
                if (user.role === 'doctor') 
                    removeWeekSettings(req.query.userId, req.query.hospId);

                var isHospPresent = false;
                for (var i = 0; i < user.hospIds.length; ++i) {
                    if (user.hospIds[i] == req.query.hospId) {
                        user.hospIds.splice(i, 1);
                        isHospPresent = true;
                        break;
                    }                    
                }
                if (isHospPresent === false) return res.status(500).json({ msg: 'This hospital is not added to user'});

                user.save(function(err, user) {
                    if (err) return res.status(500).json({ msg: err});
                    return res.status(200).json(user);
                });                
            });        
        });
    });
});

router.route('/register_hospital')
.post(Verify.verifyUser, function(req, res) {
    if (req.body.adminId === undefined || req.body.adminId === null) {
        return res.status(500).json({ msg:'Administrator user ID is not provided' });
    }
    Hospital.find({'name': req.body.name, 'phone': req.body.phone})
            .exec(function(err, hosps) {
                if (err) return res.status(500).json({msg: err});
                if (hosps.length > 0) 
                    return res.status(500).json({msg: 'Hospital with same name and phone number already exists'});

                adminId = req.body.adminId;
                delete req.body.adminId;

                Hospital.create(req.body, function (err, hosp) {
                    if (err) return res.status(500).json({ msg: err });
                    hosp.adminIds.push(adminId);
                    hosp.save(function(err, hosp) {
                        if (err) return res.status(500).json({ msg: err });
                        res.json(hosp);
                    });                    
                });
            });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', { session: false }, function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ err: info });
        }
        req.logIn(user, function(err) {        
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            
            var token = Verify.getToken(user);

            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token,
                id: user._id
            });
        });
    })(req,res,next);
});

router.route('/searchuser')
.post(Verify.verifyUser, function(req, res, next) {
    User.find(
        { $text : { $search : req.body.searchterm } }, 
        { score : { $meta: 'textScore' } }
    )
    .sort({ score : { $meta : 'textScore' } })
    .exec(function(err, users) {
        if (err) return res.status(500).json({ msg: err });
;        res.json(users);
    });
});

router.route('/getdoctors/:hospId')
.get(Verify.verifyUser, function(req, res, next) {
    Hospital.findOne({'_id': req.params.hospId})
    .populate('docIds')
    .exec(function(err, hosp) {
        if (err) return res.status(500).json({ msg: err});
        res.json(hosp);
    });
});

router.route('/getusers/:hospId')
.get(Verify.verifyUser, function(req, res, next) {
    Hospital.findOne({'_id': req.params.hospId})
    .populate('docIds assistIds')
    .exec(function(err, hosp) {
        if (err) return res.status(500).json({ msg: err});
        res.json(hosp);
    });
});

router.route('/getadmins/:hospId')
.get(Verify.verifyUser, function(req, res, next) {
    Hospital.findOne({'_id': req.params.hospId})
    .populate('adminIds')
    .exec(function(err, hosp) {
        if (err) return res.status(500).json({ msg: err});
        res.json(hosp);
    });
});

router.route('/makeadmin')
.put(Verify.verifyUser, function(req, res, next) {
    Hospital.findOne({'_id': req.body.hospId})
    .exec(function(err, hosp) {
        if (err) return res.status(500).json({ msg: err});

        var isAdmin = false;
        for (var i = 0; i < hosp.adminIds.length; ++i) {
            if (hosp.adminIds[i] == req.decoded._doc._id) {
                isAdmin = true;
                break;
            }
        }
        if (isAdmin === false) {
            return res.status(401).json({ msg: 'You are not authorized to perform this action.'})
        }

        var isPresent = false;
        for (var i = 0; i < hosp.adminIds.length; ++i) {
            if (hosp.adminIds[i] == req.body.userId) {
                isPresent = true;
                break;
            }
        }
        if (isPresent === true) {
            return res.status(500).json({ msg: 'The user is already administrator.'})
        }

        hosp.adminIds.push(req.body.userId);
        hosp.save(function(err, hosp) {
            if (err) return res.status(500).json({ msg: err });
            res.json(hosp);
        });
    });
});

router.route('/removeadmin')
.put(Verify.verifyUser, function(req, res, next) {
    Hospital.findOne({'_id': req.body.hospId})
    .exec(function(err, hosp) {
        if (err) return res.status(500).json({ msg: err});

        var isAdmin = false;
        for (var i = 0; i < hosp.adminIds.length; ++i) {
            if (hosp.adminIds[i] == req.decoded._doc._id) {
                isAdmin = true;
                break;
            }
        }
        if (isAdmin === false) {
            return res.status(401).json({ msg: 'You are not authorized to perform this action.'})
        }

        var index = null;
        for (var i = 0; i < hosp.adminIds.length; ++i) {
            if (hosp.adminIds[i] == req.body.userId) {
                index = i;
                break;
            }
        }
        if (index === null) {
            return res.status(401).json({ msg: 'The user is not an administrator.'})
        }        

        hosp.adminIds.splice(index, 1);
        hosp.save(function(err, hosp) {
            if (err) return res.status(500).json({ msg: err });
            res.json(hosp);
        });
    });
});

router.route('/logout')
.get(Verify.verifyUser, function(req, res) {
    req.logOut();
    res.status(200).json({
        status: 'Bye!'
    });
});

var populateWeekSettings = function(userId, hospId) {
    console.log('populate');
    settings.WeekSettings.find({'userId': userId, 'hospId': hospId}, function (err, arrWeekSetting) {
        if (err) throw err;
        if (arrWeekSetting.length > 0) {
            return;
        }    
        console.log('create');
        settings.WeekSettings.create({'userId': userId, 'hospId': hospId}, function (err, weekSetting) {
            if (err) throw err;
            console.log('push');
            for (var i = 0; i < 7; i++) {
                weekSetting.days.push({'index': i});
                weekSetting.days[i].timeSlots.push({'start': new Date(2010, 0, 0, 8, 0).getTime(), 'end': new Date(2010, 0, 0, 17, 0).getTime()});
            }
            weekSetting.save();
          }
        );
    });
};

var removeWeekSettings = function(userId, hospId) {
    settings.WeekSettings.findOne({'userId': userId, 'hospId': hospId}, function (err, weekSetting) {
        if (err) throw err;
        if (weeSetting !== undefined || weekSetting !== null)
            weekSetting.remove();
    });
};

module.exports = router;