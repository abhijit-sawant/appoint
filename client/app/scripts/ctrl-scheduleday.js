angular.module('appoint')    
    .controller('ScheduleDayController', ['$scope', 
                                          '$modal',
                                          '$window',  
                                          '$state',
                                          'calendarFactory',
                                          'scheduleDayFactory',
                                          'utilFactory',

        function($scope,
                 $modal,
                 $window, 
                 $state,
                 calendarFactory, 
                 scheduleDayFactory,
                 utilFactory) {
            'use strict';
            
            $scope.appointements = [];
            var docId = null;

            $scope.initAppointemnts = function() {
                var date = calendarFactory.getScheduleDayDate();
                docId = calendarFactory.getDocId();
                scheduleDayFactory.getAppointements(date, docId).then(function(appointements) {
                    $scope.appointements = appointements;
                });                
            };         
    		
            $scope.getTimeAMPM = function(date) {
                return utilFactory.getTimeAMPM(date);
            };            

            $scope.getTitle = function() {
                return calendarFactory.getScheduleDayLable();
            };

            $scope.onRemoveAppointement = function(id) {
                var reply = $window.confirm('Do you want to delete this appointement?');
                if (!reply)
                    return;
                scheduleDayFactory.removeAppointement(id, docId).then(function(appointement) {
                    for (var i = 0; i < $scope.appointements.length; ++i) {
                        if ($scope.appointements[i]._id == appointement._id) {
                            $scope.appointements.splice(i, 1);
                            break;
                        }
                    }
                });
            };

            $scope.onEditAppointement = function(id) {
                var appointement, index;
                for (var i = 0; i < $scope.appointements.length; ++i) {
                    if ($scope.appointements[i]._id == id) {
                        appointement = $scope.appointements[i];
                        index = i;
                        break;
                    }
                }
                if (appointement === undefined)
                    return;

                var inputs = {
                    data: appointement,
                    submit: function(result) {
                        scheduleDayFactory.editAppointement(result, docId).then(function(appointement){
                            $scope.appointements[index] = appointement;
                        });                        
                    }
                };

                $modal({
                    controller: 'CtrlQuickEditAppoint',
                    templateUrl: '../views/edit_appoint.tpl.html',
                    resolve: {
                        inputs: function() {
                            return inputs;
                        }
                    }
                });                
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