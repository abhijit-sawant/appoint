angular.module('appoint')
	.controller('CalController', ['$scope', 
                                  '$state',
                                  'calendarFactory',
                                  'userFactory', 
                                  'utilFactory',

        function ($scope, 
                  $state,
                 calendarFactory,
                 userFactory,
                 utilFactory) {
        'use strict';

        $scope.data_cal = null;
        $scope.doctors = null;
        $scope.selectedDocId = null;

        $scope.populateData = function() {
            if (calendarFactory.isCurrentViewWeek()) {
                $state.go('app.schedule_week');
                return;
             }
            else if (calendarFactory.isCurrentViewYear()) {
                calendarFactory.onClickYear();
            }
            else {
                calendarFactory.onClickMonth();
            }
            userFactory.getDoctors().then(function(doctors) {
                $scope.doctors = doctors;
                if (userFactory.getUserRole() === 'doctor') {
                    $scope.selectedDocId = userFactory.getUserId();                        
                }
                else {
                    if ($scope.doctors.length > 0)
                        $scope.selectedDocId = $scope.doctors[0]._id;
                }
                calendarFactory.setDocId($scope.selectedDocId);
                updateCalData();
            });
        };	

        $scope.updateDoctor = function() {
            calendarFactory.setDocId($scope.selectedDocId);
            updateCalData();
        };

        $scope.next = function() {
            calendarFactory.onClickNext();
            calendarFactory.getData().then(function(data) {
                $scope.data_cal = data;
            });
        };

        $scope.prev = function() {
            calendarFactory.onClickPrev();
            calendarFactory.getData().then(function(data) {
                $scope.data_cal = data;
            });
        };   

        $scope.today = function() {
            calendarFactory.onClickToday();
            calendarFactory.getData().then(function(data) {
                $scope.data_cal = data;
            });
        };  

        $scope.year = function() {
            calendarFactory.onClickYear();
            calendarFactory.getData().then(function(data) {
                $scope.data_cal = data;
            });
        };   

        $scope.month = function() {
            calendarFactory.onClickMonth();
            calendarFactory.getData().then(function(data) {
                $scope.data_cal = data;
            });
        };

        $scope.onCalClicked = function(row, col) {
            if (row >= $scope.data_cal.rows.length)
                return;

            if (col >= $scope.data_cal.rows[0].length)
                return;

            if (calendarFactory.isCurrentViewMonth()) {
                calendarFactory.setCurrentWeek(row);
                calendarFactory.onClickWeek();
                $state.go('app.schedule_week'); 
            }
            else if (calendarFactory.isCurrentViewYear()) {
                var month = (row + 1) * (col + 1);
                month = month - 1;
                calendarFactory.setCurrentMonth(month);
                $scope.month();
            }           
        };

        $scope.onScheduleClicked = function(row, col) {
            if (row >= $scope.data_cal.rows.length)
                return;

            if (col >= $scope.data_cal.rows[0].length)
                return;

            var lable = $scope.data_cal.rows[row][col].lable;
            calendarFactory.setScheduleDay(parseInt(lable));
            $state.go('app.schedule_day');                
        };

        $scope.isToday = function(row, col) {
            if (row > $scope.data_cal.rows.length)
                return false;
            if (col > $scope.data_cal.rows[row].length)
                return false;

            return calendarFactory.isToday(
                parseInt($scope.data_cal.rows[row][col].lable));
        };

        $scope.isCurrentViewMonth = function() {
            return calendarFactory.isCurrentViewMonth();
        };

        var updateCalData = function() {
            calendarFactory.getData().then(function(data) {
                    $scope.data_cal = data;
            }); 
        };

    }])

;