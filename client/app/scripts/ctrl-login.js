angular.module('appoint')
	.controller('CtrlLogIn', ['$scope',
                              '$location',
                              'userFactory', 

        function ($scope,
                  $location,
                  userFactory) {
            'use strict';
            $scope.userName = null;
            $scope.passWord = null;

            $scope.onLogInClicked = function() {
                userFactory.logIn($scope.userName, $scope.passWord).then(function() {
                    $location.path('selecthospital');
                });
            };
        }])
;              