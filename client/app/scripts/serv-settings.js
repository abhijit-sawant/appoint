angular.module('appoint')
       .constant('baseURL','https://localhost:3443/')
       .factory('settingsFactory', ['$resource', 
                                    'baseURL',
                                    'userFactory', 

        function($resource,
                baseURL,
                userFactory) {
            'use strict';
        	var settingsFac = {};

            //var categories = [{lable: 'Dental cleaning', duration: 30}, {lable: 'Tooth extraction', duration: 60}];
            var weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            var convertTime = function(timeSlot) {
                var dateStart = new Date();
                dateStart.setTime(timeSlot.start);
                var dateEnd = new Date();
                dateEnd.setTime(timeSlot.end);
                return {id: timeSlot._id, start: dateStart, end: dateEnd};                    
            };

            settingsFac.getDayTimeSlots = function(weekTimes, day) {
                var index = day.getDay();
                return weekTimes[index].timeSlots;
            };     

            settingsFac.isDayOff = function(weekTimes, indexDay) {
                if (indexDay > weekTimes.length)
                        return true;
                if (weekTimes[indexDay].timeSlots.length <= 0)
                        return true;
                return false;
            }; 

            settingsFac.getOpenCloseTimes = function(weekTimes) {
                var openTime = null;
                var closeTime = null;
                for (var i = 0; i < weekTimes.length; ++i) {
                    if (weekTimes[i].timeSlots.length <= 0)
                        continue;
                    var dayOpenTime = weekTimes[i].timeSlots[0].start;
                    var dayCloseTime = null;
                    if (weekTimes[i].timeSlots.length > 1) {
                        dayCloseTime = weekTimes[i].timeSlots[weekTimes[i].timeSlots.length - 1].end; 
                    }
                    else {
                        dayCloseTime = weekTimes[i].timeSlots[0].end;
                    }

                    if (openTime === null || dayOpenTime.getTime() < openTime.getTime()) {
                        openTime = dayOpenTime;
                    }

                    if (closeTime === null || dayCloseTime.getTime() > closeTime.getTime()) {
                        closeTime = dayCloseTime;
                    }              
                }
                return {open: new Date(openTime), close: new Date(closeTime)};  
            };           
        	
            settingsFac.getTimeSlots = function(userId) {
                var res = $resource(baseURL + 'weeksettings?userId=' + userId + '&hospId=' + userFactory.getHospId(), null, {
                    get: {method:'GET', headers:{'x-access-token': userFactory.getToken()}}
                    });
                
                return res.get().$promise.then(function(weeksettings) {
                        var weekTimes = [];
                        var days = weeksettings.days;
                        for (var i = 0; i < days.length; ++i) {
                            var timeSlots = days[i].timeSlots;
                            var dayTimes = [];
                            for (var j = 0; j < timeSlots.length; ++j) {                         
                                dayTimes.push(convertTime(timeSlots[j]));        
                            }
                            weekTimes[days[i].index] = ({id: days[i]._id, day: weekDays[days[i].index], timeSlots: dayTimes.slice()});
                        }
                        return weekTimes;
                    });
        	};

            settingsFac.getCategories = function(userId) {
                var res = $resource(baseURL + 'categorysettings?userId=' + userId + '&hospId=' + userFactory.getHospId(), null, {
                    get: {method:'GET', headers:{'x-access-token': userFactory.getToken()}, isArray: true}
                    });
                
                return res.get().$promise;
            };

            settingsFac.getShortestTimeSlotDur = function(docId) {
                return settingsFac.getCategories(docId).then(function(categories) {
                    var minDur = 0;
                    for (var i = 0; i < categories.length; ++i) {
                        if (i === 0 || minDur > categories[i].duration) {
                            minDur = categories[i].duration;
                        }                        
                    }
                    return minDur;
                });
            };

        	settingsFac.addTimeSlot = function(userId, indexDay) {
                var timeSlot = {'start': new Date(2010, 0, 0, 8, 0).getTime(), 'end': new Date(2010, 0, 0, 17, 0).getTime()};
                var res = $resource(baseURL + 'weeksettings/' + indexDay + '/timeslots?userId=' + userId + '&hospId=' + userFactory.getHospId(), null, {
                    save: {method:'POST', headers:{'x-access-token': userFactory.getToken()}}
                    });

                return res.save(timeSlot).$promise.then(function(timeSlot) {
                        return convertTime(timeSlot);                      
                });
        	};

            settingsFac.updateTimeSlot = function(userId, indexDay, idTimeSlot, timeSlot) {
                var res = $resource(baseURL + 'weeksettings/' + indexDay + '/timeslots/' + idTimeSlot + '?userId=' + userId + '&hospId=' + userFactory.getHospId(), null, {
                    update: {method:'PUT', headers:{'x-access-token': userFactory.getToken()}}
                    });

                return res.update({start: timeSlot.start.getTime(), end: timeSlot.end.getTime()}).$promise.then(function(timeSlot) {
                        return convertTime(timeSlot);
                });
            };

        	settingsFac.removeTimeSlot = function(userId, indexDay, idTimeSlot) {
                var res = $resource(baseURL + 'weeksettings/' + indexDay + '/timeslots/' + idTimeSlot + '?userId=' + userId + '&hospId=' + userFactory.getHospId(), null, {
                    delete: {method:'DELETE', headers:{'x-access-token': userFactory.getToken()}}
                    });

                return res.delete().$promise;
        	};   

        	settingsFac.addCategory = function(userId, input_lable, input_duration) {
                var category = {lable: input_lable, duration: input_duration};
                var res = $resource(baseURL + 'categorysettings' + '?userId=' + userId + '&hospId=' + userFactory.getHospId(), null, {
                    save: {method:'POST', headers:{'x-access-token': userFactory.getToken()}}
                    });
                return res.save(category).$promise;
        	};

        	settingsFac.removeCategory = function(userId, id) {
                var res = $resource(baseURL + 'categorysettings/' + id + '?userId=' + userId + '&hospId=' + userFactory.getHospId(), null, {
                    delete: {method:'DELETE', headers:{'x-access-token': userFactory.getToken()}}
                    });

                return res.delete().$promise;
        	};

        	return settingsFac;
        }]);