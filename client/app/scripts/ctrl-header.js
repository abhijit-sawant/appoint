angular.module('appoint')
	.controller('CtrlHeader', ['$scope',
                              '$location',
                              '$modal',
                              '$state', 
                              'userFactory', 

        function ($scope,
                  $location,
                  $modal,
                  $state,
                  userFactory) {
            'use strict';
            $scope.name = '';

            $scope.populateData = function() {
                userFactory.getUserInfo().then(function(user) {
                    $scope.name = user.firstname + ' ' + user.lastname;
                });
            };

            $scope.onMakeAppoint = function() {
                var inputs = {
                    submit: function(result) {
                        $state.reload();
                    }
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

            $scope.onAddPatient = function () {
                var inputs = {
                    submit: function(result) {
                        $state.reload();
                    }
                };

                $modal({
                    controller: 'CtrlPatientAdd',
                    templateUrl: '../views/add_patient.tpl.html',
                    resolve: {
                        inputs: function() {
                            return inputs;
                        }
                    }                    
                });
            };

            $scope.showSettings = function () {
                if (userFactory.getUserRole() === 'doctor') 
                    return true;
                return false;
            };

            $scope.showManageUsers = function() {
                return userFactory.isAdmin();
            };

            $scope.onLogOutClicked = function() {
                userFactory.logOut().then(function() {
                    $location.path('/');
                });
            };
        }])
;