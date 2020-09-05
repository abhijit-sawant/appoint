angular.module('appoint')
    .config(['ngToastProvider', function(ngToast) {
        ngToast.configure({
            horizontalPosition: 'center',
        });
    }])
	.controller('CtrlMakeAppoint', ['$scope',
                                    '$modal',
                                    'calendarFactory', 
                                    'inputs',
                                    'ngToast',
                                    'scheduleDayFactory',  
                                    'settingsFactory',
                                    'userFactory',
                                    'utilFactory',

    	function ($scope,
                  $modal,
                  calendarFactory, 
                  inputs,
                  ngToast, 
                  scheduleDayFactory,
                  settingsFactory,
                  userFactory,
                  utilFactory) {
            'use strict';
            $scope.searchTermPatient = null;
            $scope.selectedPatient = null;
            $scope.selectedDate = new Date();
    		$scope.availTimeSlots = [];
    		$scope.reasons = null;
    		$scope.selectedReason = null;	
            $scope.selectedTime = null;
            $scope.weekTimes = null;

            $scope.isTimeValid = true;
            $scope.isPatientValid = true;

            $scope.appointments = [];
            $scope.isReschedule = false;
            $scope.selectedTimeLabel = '';
            $scope.selectedTimeIndex = null;

            $scope.doctors = null;
            $scope.selectedDocId = null;
            $scope.selectedDocLabel = null;

            var selectedAppintement = null;


            var setDoctorLabel = function() {
                for (var i = 0; i < $scope.doctors.length; ++i) {
                    if ($scope.doctors[i]._id === $scope.selectedDocId) {
                        $scope.selectedDocLabel = $scope.doctors[i].firstname + ' ' +
                            $scope.doctors[i].lastname + ' - ' + $scope.doctors[i].email;
                        break;
                    }
                }
            };

            $scope.populateData = function() {
                //selectedAppintement = scheduleDayFactory.getSlectedAppointment();
                //scheduleDayFactory.setSlectedAppointment(null);

                userFactory.getDoctors().then(function(doctors) {
                    $scope.doctors = doctors;
                    if (inputs.docId !== undefined) {
                        $scope.selectedDocId = inputs.docId;
                        setDoctorLabel();
                    }
                    else if (selectedAppintement !== null) {
                        $scope.selectedDocId = selectedAppintement.docId;
                        setDoctorLabel();                         
                    }
                    else {
                        if (userFactory.getUserRole() === 'doctor') {
                            $scope.selectedDocId = userFactory.getUserId();                        
                        }
                        else {
                            if ($scope.doctors.length > 0)
                                $scope.selectedDocId = $scope.doctors[0]._id;
                        }
                    }                    

                    settingsFactory.getCategories($scope.selectedDocId).then(function(categories) {
                        $scope.reasons = categories;

                        settingsFactory.getTimeSlots($scope.selectedDocId).then(function(weekTimes) {
                            var i;
                            $scope.weekTimes = weekTimes;
                            if (inputs.docId !== undefined) {
                                $scope.selectedDate = inputs.date;
                                $scope.selectedTime = inputs.time;
                                $scope.selectedTimeLabel =  $scope.getTimeAMPM($scope.selectedTime);
                                for (i = 0; i < $scope.reasons.length; ++i)
                                {
                                    if ($scope.reasons[i]._id === inputs.reason_id) {
                                        $scope.selectedReason = $scope.reasons[i];
                                        break;
                                    }
                                }
                                updateTimeSlots();
                            }
                            else if (selectedAppintement !== null) {
                                $scope.isReschedule = true;
                                $scope.selectedPatient = selectedAppintement.patientId;
                                $scope.selectedDate = new Date();   
                                
                                $scope.selectedDate.setFullYear(selectedAppintement.year);
                                $scope.selectedDate.setMonth(selectedAppintement.month);
                                $scope.selectedDate.setDate(selectedAppintement.date);

                                $scope.selectedTime = selectedAppintement.start;
                                $scope.selectedTimeLabel =  $scope.getTimeAMPM($scope.selectedTime);

                                for (i = 0; i < $scope.reasons.length; ++i)
                                {
                                    if ($scope.reasons[i].lable === selectedAppintement.reason) {
                                        $scope.selectedReason = $scope.reasons[i];
                                        break;
                                    }
                                }
                                updateTimeSlots();
                            }
                            else {                         
                                if ($scope.reasons.length > 0) {
                                    $scope.selectedReason = $scope.reasons[0];                    
                                }
                                updateTimeSlots();
                            }                      
                        });
                    });
                });                
            };

            $scope.onDoctorChanged = function() {
                settingsFactory.getCategories($scope.selectedDocId).then(function(categories) {
                    $scope.reasons = categories;

                    settingsFactory.getTimeSlots($scope.selectedDocId).then(function(weekTimes) {
                        $scope.weekTimes = weekTimes;                  
                        if ($scope.reasons.length > 0) {
                            $scope.selectedReason = $scope.reasons[0];                    
                        }
                        updateTimeSlots();
                    });
                });
            };

            $scope.getTimeAMPM = function(date) {
                return utilFactory.getTimeAMPM(date);
            };  

            $scope.onDateChanged = function() {
                $scope.selectedTime = null;
                $scope.selectedTimeLabel = ''; 
                $scope.selectedTimeIndex = null;               
                updateTimeSlots();
            };

            $scope.onReasonChanged = function() {
                $scope.selectedTime = null;
                $scope.selectedTimeLabel = ''; 
                $scope.selectedTimeIndex = null;               
                updateTimeSlots();
            };

            var updateTimeSlots = function() {
                $scope.availTimeSlots = [];

                if ($scope.selectedReason === null)
                    return;
                var duration = $scope.selectedReason.duration;

                return scheduleDayFactory.getAppointements($scope.selectedDate, $scope.selectedDocId).then(function(appointements) {
                    $scope.appointments = appointements;

                    var dayTimeSlots = settingsFactory.getDayTimeSlots($scope.weekTimes, $scope.selectedDate);
                    var count = -1;

                    var currentDate = new Date();
                    for (var i = 0; i < dayTimeSlots.length; i++) {
                        var timeStart = dayTimeSlots[i].start;
                        var timeEnd = new Date(timeStart.getTime() + duration*60000);   

                        while(timeEnd <= dayTimeSlots[i].end) {

                            var timeNow = $scope.selectedDate;
                            timeNow.setHours(timeStart.getHours());
                            timeNow.setMinutes(timeStart.getMinutes());
                            if (timeNow.getTime() > Date.now() && !doesConflict($scope.appointments, timeStart, timeEnd)) {
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

            $scope.onTimeSelected = function(event) {
                $scope.selectedTimeIndex = event.target.attributes.id.value;
                $scope.selectedTime = getTimeFromId($scope.selectedTimeIndex);
                $scope.selectedTimeLabel = $scope.getTimeAMPM($scope.selectedTime);

                if ($scope.selectedTime !== '' || $scope.selectedTime !== null)
                    $scope.isTimeValid = true;
            };
    		

            $scope.onDoneClicked = function() {
                if (runValidation() === false)
                    return;

                if ($scope.selectedTime === null)
                    return;     

                if ($scope.isReschedule === true)
                    rescheduleAppoint();                    
                else
                    makeAppoint();

                inputs.submit();
                $scope.$hide();
            };

            $scope.onClose = function() {
                $scope.$hide();
            }; 

            var makeAppoint = function() {
                var timeStart = $scope.selectedTime;
                var timeEnd = new Date(timeStart.getTime() + $scope.selectedReason.duration*60000);
                scheduleDayFactory.makeAppointement($scope.selectedDocId,
                                                    $scope.selectedDate, 
                                                    timeStart, 
                                                    timeEnd, 
                                                    $scope.selectedReason.lable,
                                                    $scope.selectedPatient._id).then(function(appointement) {
                    ngToast.create({dismissButton: 'true',
                                    dismissOnTimeout: false,
                                    content: 'Your appointment is set on ' + 
                                    calendarFactory.getDayLable($scope.selectedDate.getDate(), 
                                        $scope.selectedDate.getMonth(), $scope.selectedDate.getFullYear()) +
                                    ' at ' + $scope.getTimeAMPM($scope.selectedTime)});
                    updateTimeSlots();
                    resetInputs();
                });
            };  

            var rescheduleAppoint = function() {
                selectedAppintement.year = $scope.selectedDate.getFullYear();
                selectedAppintement.month = $scope.selectedDate.getMonth();
                selectedAppintement.date = $scope.selectedDate.getDate();
                selectedAppintement.start = $scope.selectedTime;
                selectedAppintement.end = new Date(selectedAppintement.start.getTime() + 
                    $scope.selectedReason.duration*60000);
                scheduleDayFactory.rescheduleAppointement(selectedAppintement, $scope.selectedDocId).then(function(appointement) {
                    ngToast.create({dismissButton: 'true',
                                    dismissOnTimeout: false,
                                    content: 'Your appointment is rescheduled on ' + 
                                    calendarFactory.getDayLable($scope.selectedDate.getDate(), 
                                        $scope.selectedDate.getMonth(), $scope.selectedDate.getFullYear()) +
                                    ' at ' + $scope.getTimeAMPM($scope.selectedTime)});
                    updateTimeSlots();
                    resetInputs();
                });
            }; 

            var getTimeFromId = function(id) {
                for (var i = 0; i < $scope.availTimeSlots.length; i++) {
                    if ($scope.availTimeSlots[i].id == id) {
                        return $scope.availTimeSlots[i].time;
                    }
                }
                return null;
            };

            var runValidation = function() {
                if ($scope.makeAppointForm.$valid !== true)
                    return;

                var bValid = true;
                if ($scope.selectedTime === "" || $scope.selectedTime === null)
                {
                    $scope.isTimeValid = false;
                    bValid = false;
                }
                else
                    $scope.isTimeValid = true;

                if ($scope.isPatientSelected() === false)
                {
                    $scope.isPatientValid = false;
                    bValid = false;
                }

                return bValid;           
            };

            var resetInputs = function() {
                $scope.selectedDate = new Date();
                $scope.selectedTime = null;

                $scope.isTimeValid = true;
                $scope.isPatientValid = true;
            };

            $scope.isPatientSelected = function() {
                if ($scope.selectedPatient === null) {
                    return false;
                }
                return true;
            };

            $scope.onSearchPatient = function() {
                var inputs = {
                    searchTerm: $scope.searchTermPatient,
                    submit: function(result) {
                        $scope.selectedPatient = result;
                        $scope.isPatientValid = true;
                    }
                };

                $modal({
                    controller: 'CtrlPatientSearch',
                    templateUrl: '../views/search_user.tpl.html',
                    resolve: {
                        inputs: function() {
                            return inputs;
                        }
                    }
                });                
            };           
	}])

.controller('CtrlPatientSearch', ['$scope', 
                                  'inputs',
                                  'userFactory', 

    function($scope, 
             inputs, 
             userFactory) {

        $scope.searchTerm = inputs.searchTerm;
        $scope.searchResult = null;

        $scope.onSearchUser = function() {
            if ($scope.searchTerm === '' || $scope.searchTerm === null)
                return;

            userFactory.searchUser($scope.searchTerm).then(function(response) {
                $scope.searchResult = response;
            });
        };
        $scope.onSearchUser();

        $scope.onSelect = function(index) {
            if (index >= $scope.searchResult.length)
                throw Error('Index out of range');
            inputs.submit($scope.searchResult[index]);
            $scope.$hide();
        };

        $scope.onClose = function() {
            $scope.$hide();
        };
}]);                                  