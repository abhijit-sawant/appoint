angular.module('appoint')    
	.controller('CtrlTimeSlots', ['$scope', 
                                  'settingsFactory', 
                                  'userFactory',

        function ($scope, 
                  settingsFactory,
                  userFactory) {
            'use strict';
            $scope.hstep = 1;
            $scope.mstep = 15;

            var userId = null;          

            $scope.populateData = function() {
                userId = userFactory.getUserId();
                settingsFactory.getTimeSlots(userId).then(function(weekTimes) {
                    $scope.weekTimes = weekTimes;
                });
            };

            $scope.ismeridian = true;
            $scope.toggleMode = function() {
                $scope.ismeridian = ! $scope.ismeridian;
            };

            $scope.onAddClicked = function(indexDay) {
                settingsFactory.addTimeSlot(userId, indexDay).then(function(timeSlot) {
                    $scope.weekTimes[indexDay].timeSlots.push(timeSlot);
                });
            };

            $scope.onRemoveClicked = function(indexDay, idTimeSlot) {
                settingsFactory.removeTimeSlot(userId, indexDay, idTimeSlot).then(function(response) {
                    for(var i = 0; i < $scope.weekTimes[indexDay].timeSlots.length; ++i) {
                        if ($scope.weekTimes[indexDay].timeSlots[i].id == idTimeSlot) {
                            $scope.weekTimes[indexDay].timeSlots.splice(i, 1);
                            break;
                        }
                    }
                });
            }; 

            $scope.onTimeChanged = function(indexDay, timeSlot) {
                settingsFactory.updateTimeSlot(userId, indexDay, timeSlot.id, timeSlot).then(function(timeSlotNew) {
                    for(var i = 0; i < $scope.weekTimes[indexDay].timeSlots.length; ++i) {
                        if ($scope.weekTimes[indexDay].timeSlots[i].id == timeSlot.id) {
                            $scope.weekTimes[indexDay].timeSlots[i] = timeSlotNew;
                            break;
                        }
                    }
                });
            };

            $scope.isDayOff = function(indexDay) {
               return settingsFactory.isDayOff($scope.weekTimes, indexDay);
            };   
	}])

    .controller('CtrlCategories', ['$scope', 
                                   'settingsFactory',
                                   'userFactory', 

        function ($scope, 
                  settingsFactory,
                  userFactory) {
            
            $scope.categories = null;
            $scope.input_lable = "";
            $scope.input_duration = null;
            $scope.isLableValid = true;
            $scope.isDurationValid = true;

            var userId = null;

            $scope.populateData = function() {
                userId = userFactory.getUserId();
                settingsFactory.getCategories(userId).then(function(categories) {
                    $scope.categories = categories;
                });
            };

            $scope.onAddClicked = function(input_lable, input_duration) {
                if (input_lable === "") {
                    $scope.isLableValid = false;
                }
                else
                    $scope.isLableValid = true;

                if (input_duration === null) {
                    $scope.isDurationValid = false;
                }
                else
                    $scope.isDurationValid = true;

                if (!$scope.isLableValid || !$scope.isDurationValid)
                    return;

                settingsFactory.addCategory(userId, input_lable, input_duration).then(function(category) {
                    $scope.categories.push(category);
                });
                $scope.input_lable = "";
                $scope.input_duration = null;  
            };

            $scope.onRemoveClicked = function(id) {
                settingsFactory.removeCategory(userId, id).then(function(response) {
                    for (var i = 0; i < $scope.categories.length; ++i) {
                        if ($scope.categories[i]._id == id) {
                            $scope.categories.splice(i, 1);
                            break;
                        }
                    }
                });
            };

    }])    
;