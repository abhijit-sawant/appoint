angular.module('appoint')    
    .controller('CtrlEditAppoint', ['$scope', 
                                          '$modal',
                                          '$window',  
                                          '$state',
                                          'calendarFactory',
                                          'scheduleDayFactory',
                                          'userFactory',
                                          'utilFactory',

        function($scope,
                 $modal,
                 $window, 
                 $state,
                 calendarFactory, 
                 scheduleDayFactory,
                 userFactory,
                 utilFactory) {
            'use strict';

            $scope.appointement = null;

            $scope.populateData = function() {
                $scope.appointement = scheduleDayFactory.getSlectedAppointment();
            };

            $scope.getAppointLabel = function() {
                var label = calendarFactory.getDayLable($scope.appointement.date,
                    $scope.appointement.month, $scope.appointement.year);
                return utilFactory.getTimeAMPM($scope.appointement.start) + ' - ' + label;
            };

            $scope.onBack = function() {
                $window.history.back();
            };

            $scope.onReschedule = function() {
                var inputs = {
                    submit: function(result) {
                        $scope.appointement = result;
                    }
                };

                $modal({
                    controller: 'CtrlRescheduleAppoint',
                    templateUrl: '../views/reschedule_appoint.tpl.html',
                    resolve: {
                        inputs: function() {
                            return inputs;
                        }
                    }
                });                
            };

            $scope.onRemoveAppoint = function(id) {
                var reply = $window.confirm('Do you want to delete this appointement?');
                if (!reply)
                    return;
                var docId = calendarFactory.getDocId();
                scheduleDayFactory.removeAppointement($scope.appointement._id, docId).then(function(appointement) {
                    scheduleDayFactory.setSlectedAppointment(null);
                    $window.history.back();
                });
            };

            $scope.onDone = function() {
                var docId = calendarFactory.getDocId();
                scheduleDayFactory.editAppointement($scope.appointement, docId).then(function(appointement){
                    $scope.appointement = appointement;
                    $window.history.back();
                });                 
            };
}])

.controller('CtrlRescheduleAppoint', ['$scope', 
                                      'inputs',
                                      'scheduleDayFactory',
                                      'settingsFactory',
                                      'userFactory',
                                      'utilFactory',
                                
    function($scope, 
             inputs,
             scheduleDayFactory,
             settingsFactory,
             userFactory,
             utilFactory) {

        var selectedAppintement = null;
        var weekTimes = null;

        $scope.populateData = function() {
            selectedAppintement = scheduleDayFactory.getSlectedAppointment(); 

            $scope.selectedDocId = selectedAppintement.docId;
            $scope.selectedPatient = selectedAppintement.patientId;

            $scope.selectedDate = new Date();                
            $scope.selectedDate.setFullYear(selectedAppintement.year);
            $scope.selectedDate.setMonth(selectedAppintement.month);
            $scope.selectedDate.setDate(selectedAppintement.date);

            $scope.selectedTime = selectedAppintement.start;
            $scope.selectedTimeLabel =  $scope.getTimeAMPM($scope.selectedTime);            

            userFactory.getDoctors().then(function(doctors) {
                $scope.doctors = doctors;
                for (var i = 0; i < $scope.doctors.length; ++i) {
                    if ($scope.doctors[i]._id === $scope.selectedDocId) {
                        $scope.selectedDocLabel = $scope.doctors[i].firstname + ' ' +
                            $scope.doctors[i].lastname + ' - ' + $scope.doctors[i].email;
                        break;
                    }
                }                         

                settingsFactory.getCategories($scope.selectedDocId).then(function(categories) {
                    reasons = categories;
                    for (var i = 0; i < reasons.length; ++i)
                    {
                        if (reasons[i].lable === selectedAppintement.reason) {
                            $scope.selectedReason = reasons[i];
                            break;
                        }
                    }                    
                    settingsFactory.getTimeSlots($scope.selectedDocId).then(function(weekTimesIn) {
                        weekTimes = weekTimesIn;
                        updateTimeSlots();                     
                    });
                });
            });                
        };   

        $scope.onDateChanged = function() {
            $scope.selectedTime = null;
            $scope.selectedTimeLabel = ''; 
            $scope.selectedTimeIndex = null;               
            updateTimeSlots();
        };         

        $scope.onTimeSelected = function(event) {
            $scope.selectedTimeIndex = event.target.attributes.id.value;
            $scope.selectedTime = getTimeFromId($scope.selectedTimeIndex);
            $scope.selectedTimeLabel = $scope.getTimeAMPM($scope.selectedTime);

            if ($scope.selectedTime !== '' || $scope.selectedTime !== null)
                $scope.isTimeValid = true;
        };  
        
        $scope.getTimeAMPM = function(date) {
            return utilFactory.getTimeAMPM(date);
        };                  

        $scope.onDone = function() {
            selectedAppintement.year = $scope.selectedDate.getFullYear();
            selectedAppintement.month = $scope.selectedDate.getMonth();
            selectedAppintement.date = $scope.selectedDate.getDate();
            selectedAppintement.start = $scope.selectedTime;
            selectedAppintement.end = new Date(selectedAppintement.start.getTime() + 
                $scope.selectedReason.duration*60000);
            scheduleDayFactory.rescheduleAppointement(selectedAppintement, $scope.selectedDocId).then(function(appointement) {
                inputs.submit(appointement);
            });
            $scope.$hide();
        };     

        $scope.onClose = function() {
            $scope.$hide();
        }; 

        var updateTimeSlots = function() {
            $scope.availTimeSlots = [];

            if ($scope.selectedReason === null)
                return;
            var duration = $scope.selectedReason.duration;

            return scheduleDayFactory.getAppointements($scope.selectedDate, $scope.selectedDocId).then(function(appointments) {
                var dayTimeSlots = settingsFactory.getDayTimeSlots(weekTimes, $scope.selectedDate);
                var count = -1;
                var currentDate = new Date();
                for (var i = 0; i < dayTimeSlots.length; i++) {
                    var timeStart = dayTimeSlots[i].start;
                    var timeEnd = new Date(timeStart.getTime() + duration*60000);   

                    while(timeEnd <= dayTimeSlots[i].end) {

                        var timeNow = $scope.selectedDate;
                        timeNow.setHours(timeStart.getHours());
                        timeNow.setMinutes(timeStart.getMinutes());
                        if (timeNow.getTime() > Date.now() && !doesConflict(appointments, timeStart, timeEnd)) {
                            count += 1;
                            $scope.availTimeSlots.push({id: count, time: timeStart});
                        }                        
                        timeStart = timeEnd;
                        timeEnd = new Date(timeStart.getTime() + duration*60000);
                    }
                }
            });
        };      

        var doesConflict = function(appointments, timeStart, timeEnd) {  
            for (var i = 0; i < appointments.length; i++) {
                if (timeStart >= appointments[i].start && timeStart < appointments[i].end)
                    return true;
                if (timeEnd > appointments[i].start && timeEnd <= appointments[i].end)
                    return true;
            }
            return false;
        }; 

        var getTimeFromId = function(id) {
            for (var i = 0; i < $scope.availTimeSlots.length; i++) {
                if ($scope.availTimeSlots[i].id == id) {
                    return $scope.availTimeSlots[i].time;
                }
            }
            return null;
        };                        
}]);