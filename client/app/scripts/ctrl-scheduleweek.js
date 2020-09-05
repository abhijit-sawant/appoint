angular.module('appoint')    
    .controller('ScheduleWeekController', ['$scope', 
                                          '$modal',
                                          '$window',  
                                          '$state',
                                          'calendarFactory',
                                          'scheduleDayFactory',
                                          'settingsFactory',
                                          'userFactory',
                                          'utilFactory',

        function($scope,
                 $modal,
                 $window, 
                 $state,
                 calendarFactory, 
                 scheduleDayFactory,
                 settingsFactory,
                 userFactory,
                 utilFactory) {
            'use strict';
            
            $scope.appointements = [];

            $scope.header = [];
            $scope.rows = [];
            $scope.t = 0;
            $scope.h = 0;
            $scope.appointData = null;
            $scope.headers = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            $scope.dayLable = null;
            $scope.weekDates = null;
            $scope.reasons = [];
            $scope.selectedReason = null;
            $scope.timeSlots = [];
            $scope.doctors = null;
            $scope.selectedDocId = null;

            var timeSoltHeight = 50; //height of time slot in pixel
            var timeSlotDur = null;
            var noSelectionReason = 'No Selection';
            var offDays = null;

            $scope.populateData = function() {
                $scope.selectedDocId = calendarFactory.getDocId();
                var itemNoSel = {lable: noSelectionReason, duration: 0};
                $scope.selectedReason = itemNoSel;
                userFactory.getDoctors().then(function(doctors) {
                    $scope.doctors = doctors;                    
                    settingsFactory.getCategories($scope.selectedDocId).then(function(categories) {
                        $scope.reasons = categories;                      
                        $scope.reasons.unshift(itemNoSel);                       
                    });                                                          
                });
                populateCalData();
            };

            var populateCalData = function() {
                var i, j, k;
                settingsFactory.getShortestTimeSlotDur($scope.selectedDocId).then(function(minDur) {
                    timeSlotDur = minDur;
                    settingsFactory.getTimeSlots($scope.selectedDocId).then(function(weekTimes) {
                        var openCloseTime = settingsFactory.getOpenCloseTimes(weekTimes);
                        var i, j, k;
                        offDays = Array(7).fill(false);
                        for (i = 0; i < offDays.length; ++i) {
                            if (settingsFactory.isDayOff(weekTimes, i)) {
                                offDays[i] = true;
                            }
                        }

                        var time = openCloseTime.open;
                        $scope.timeSlots = [];
                        while (time.getTime() <= openCloseTime.close.getTime()) {
                            $scope.timeSlots.push(utilFactory.getTimeAMPM(time));
                            time.setMinutes(time.getMinutes() + timeSlotDur);
                        }
                        $scope.event_grp_height = timeSoltHeight * ($scope.timeSlots.length - 1);

                        $scope.appointData = new Array(7);
                        $scope.weekDates = calendarFactory.getWeekDates();
                        for (i = 0; i < $scope.appointData.length; ++i) {
                            $scope.appointData[i] = new Array($scope.timeSlots.length - 1);
                            for (j = 0; j < $scope.timeSlots.length - 1; ++j) {
                                var data = {empty: true, id: null, top: (timeSoltHeight*j) - 1, height: timeSoltHeight + 1,
                                    reason: null, time: $scope.timeSlots[j]};
                                if (offDays[i] === true) {
                                    data.empty = false;
                                }
                                else {
                                    var start = getDateFrmTimeString(data.time);
                                    var end = new Date(start.getTime());
                                    end.setMinutes(start.getMinutes() + timeSlotDur);

                                    var date = new Date($scope.weekDates[i].date.getTime());
                                    date.setHours(end.getHours());
                                    date.setMinutes(end.getMinutes());

                                    if (date.getTime() < Date.now()) {
                                         data.empty = false;
                                    }
                                    else {
                                        var inside = false;                                        
                                        for (k = 0; k < weekTimes[i].timeSlots.length; ++k) {
                                            if (start.getTime() >= weekTimes[i].timeSlots[k].start.getTime() &&
                                                end.getTime() <= weekTimes[i].timeSlots[k].end.getTime() ) {                                      
                                                inside = true;
                                            }
                                        }
                                        if (inside === false) {
                                            data.empty = false;
                                        }
                                    }
                                }
                                $scope.appointData[i][j] = data;
                            }
                        }
                        updateCalData();
                    });
                });
            };

            $scope.showAvailSlots = function() {
                if ($scope.selectedReason.lable === noSelectionReason)
                    return false;
                return true;
            };

            $scope.updateDoctor = function() {
                calendarFactory.setDocId($scope.selectedDocId);
                populateCalData();
            }; 

            $scope.onReasonChanged = function() {
                populateCalData();
            };

            $scope.next = function() {
                calendarFactory.onClickNext();
                populateCalData();
            };  
            
            $scope.prev = function() {
                calendarFactory.onClickPrev();
                populateCalData();
            };   

            $scope.today = function() {
                calendarFactory.onClickToday();
                $state.go('app');
            };            

            $scope.year = function() {
                calendarFactory.onClickYear();
                $state.go('app');
            };   

            $scope.month = function() {
                calendarFactory.onClickMonth();
                $state.go('app');
            };                                            

            var updateCalData = function() {
                $scope.dayLable = calendarFactory.getScheduleMonthLable();                         
                //var result = document.getElementById("events-wrapper");
                //var appointSlotHeight = result.offsetHeight;
                var i;
                var appointSlotHeight = $scope.event_grp_height; 
                var timelineStart = getMinutesFrmTimeString('08:00');
                var timelineUnitDuration = getMinutesFrmTimeString('19:00') - timelineStart;
                $scope.weekDates = calendarFactory.getWeekDates();   

                var dates = [];
                for (i = 0; i < $scope.weekDates.length; ++i) {
                    dates.push($scope.weekDates[i].date);
                }     

                scheduleDayFactory.getAppointementsDays(dates, $scope.selectedDocId).then(function(appointements) {
                    var startSlot, i, j, k;
                    $scope.appointements = appointements;
                    for (i = 0; i < appointements.length; ++i) {
                        var dayAppoints = $scope.appointements[i].data;
                        //populate slots with appointement
                        for (j = 0; j < dayAppoints.length; ++j) {
                            var appoint = dayAppoints[j];
                            var start = getMinutesFrmTime(appoint.start);
                            var duration = getMinutesFrmTime(appoint.end) - start;

                            var appointTop = appointSlotHeight*(start - timelineStart)/timelineUnitDuration;
                            var appointHeight = appointSlotHeight*duration/timelineUnitDuration;
                            var timeString = utilFactory.getTimeAMPM(appoint.start) + ' - ' + utilFactory.getTimeAMPM(appoint.end);

                            startSlot = (start - timelineStart) / timeSlotDur;
                            $scope.appointData[i][startSlot] = {empty: false, id: appoint._id, top: appointTop - 1, 
                                height: appointHeight + 1, reason: appoint.reason, time: timeString};

                            //adjust empty data
                            var endSlot = startSlot + (duration / timeSlotDur); 
                            for (k = startSlot + 1; k < endSlot; ++k) {
                                $scope.appointData[i].splice(k, 1);
                            }                            
                        }
                        //adjust slots above appointement
                        for (j = 1; j < $scope.appointData[i].length; ++j) {
                            if ($scope.appointData[i][j].empty === false) {
                                var selReasonDur = $scope.selectedReason.duration;
                                var slotToSplice = j - 1;
                                var noToSplice = (selReasonDur / timeSlotDur) - 1;
                                for (k = 0; k < noToSplice; ++k) {
                                    if ($scope.appointData[i][slotToSplice].empty === false) {
                                        break;
                                    }
                                    $scope.appointData[i].splice(slotToSplice, 1);
                                    slotToSplice = slotToSplice - 1;
                                }
                            }                            
                        }                     
                    }
                });                                         
            };

            function cleanArray(actual) {
                var newArray = [];
                for (var i = 0; i < actual.length; i++) {
                    if (actual[i] !== null) {
                        newArray.push(actual[i]);
                    }
                }
                return newArray;
            }

            function getMinutesFrmTime(time) {
                var timeStamp = time.getHours()*60 + time.getMinutes();
                return timeStamp;
            } 

            function getMinutesFrmTimeString(time) {
                //convert hh:mm to timestamp
                time = time.replace(/ /g,'');
                var timeArray = time.split(':');
                var timeStamp = parseInt(timeArray[0])*60 + parseInt(timeArray[1]);
                return timeStamp;
            } 

            function getDateFrmTimeString(time) {
                //converts hh:mm am/pm to date object
                var timeArray = time.split(':');
                var ampm = timeArray[1].substring(3);
                var hours = parseInt(timeArray[0]);
                if (ampm === 'PM' && hours !== 12) {
                    hours = hours + 12;
                } 
                else if (ampm === 'AM' && hours === 12) {
                    hours = hours + 12;
                }
                var minutes = parseInt(timeArray[1].substring(0, 2));
                var date = new Date(2010, 0, 0, 8, 0);
                date.setHours(hours);
                date.setMinutes(minutes);
                return date;
            }            

            $scope.isToday = function(col) {
                if (col > $scope.weekDates.length)
                    return false;
                if (calendarFactory.isToday(
                    $scope.weekDates[col].date.getDate())) {
                    return true;
                }
                return false;
            };                              

            $scope.getTimeAMPM = function(date) {
                if (date === null)
                    return '';
                return utilFactory.getTimeAMPM(date);
            };            

            $scope.getTitle = function() {
                return calendarFactory.getScheduleDayLable();
            };

            $scope.onRemoveAppointement = function(id) {
                var reply = $window.confirm('Do you want to delete this appointement?');
                if (!reply)
                    return;
                scheduleDayFactory.removeAppointement(id, $scope.selectedDocId).then(function(appointement) {
                    for (var i = 0; i < $scope.appointements.length; ++i) {
                        if ($scope.appointements[i]._id == appointement._id) {
                            $scope.appointements.splice(i, 1);
                            break;
                        }
                    }
                });
            };

            $scope.openAppoint = function(id) {
                var appointement, index_day, index_time;
                for (var i = 0; i < $scope.appointements.length; ++i) {
                    var dayAppoints = $scope.appointements[i].data;
                    for (var j = 0; j < dayAppoints.length; ++j) {
                        if (dayAppoints[j]._id == id) {
                            appointement = dayAppoints[j];
                            index_day = i;
                            index_time = j;
                            break;
                        }
                    }
                }
                if (appointement === undefined)
                    return;

                scheduleDayFactory.setSlectedAppointment(appointement);
                $state.go('app.editappoint');

                // var inputs = {
                //     data: appointement,
                //     submit: function(result) {
                //         scheduleDayFactory.editAppointement(result, $scope.selectedDocId).then(function(appointement){
                //             $scope.appointements[index_day].data[index_time] = appointement;
                //         });                        
                //     }
                // };

                // $modal({
                //     controller: 'CtrlQuickEditAppoint',
                //     templateUrl: '../views/edit_appoint.tpl.html',
                //     resolve: {
                //         inputs: function() {
                //             return inputs;
                //         }
                //     }
                // });                
            };

            $scope.onRescheduleAppointement = function(id) {
                var appointement = null;
                for (var i = 0; i < $scope.appointements.length; ++i) {
                    if ($scope.appointements[i]._id === id) {
                        appointement = $scope.appointements[i];
                        break;
                    }
                }
                if (appointement === null)
                    return;

                scheduleDayFactory.setSlectedAppointment(appointement);
                $state.go('app.rescheduleappoint');
            };

            $scope.makeAppoint = function(row, col) {
                var inputs = {
                    submit: function(result) {
                        $state.reload();
                    },
                    docId: $scope.selectedDocId,
                    date: $scope.weekDates[col].date,
                    time: getDateFrmTimeString($scope.appointData[col][row].time),
                    reason_id: $scope.selectedReason._id
                };

                $modal({
                    controller: 'CtrlMakeAppoint',
                    templateUrl: '../views/make_appoint.tpl.html',
                    resolve: {
                        inputs: function() {
                            return inputs;
                        }
                    }                    
                });                
            };
}])

.controller('CtrlQuickEditAppoint', ['$scope', 
                                'inputs',
                                
    function($scope, 
             inputs) {
        $scope.appointement = inputs.data;

        $scope.onDone = function() {
            inputs.submit($scope.appointement);
            $scope.$hide();
        };     

        $scope.onClose = function() {
            $scope.$hide();
        };        
}]);