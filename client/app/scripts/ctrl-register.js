angular.module('appoint')
.controller('CtrlRegister', ['$scope',
                             '$location',
                             'ngToast',
                             'userFactory', 

    function ($scope,
              $location,
              ngToast,
              userFactory) {

        'use strict';
        $scope.firstName = null;
        $scope.lastName = null;
        $scope.phoneNo = null;
        $scope.userName = null;
        $scope.passWord = null;

        $scope.onRegister = function() {
            if ($scope.registerForm.$valid !== true)
                return;

            var user = {
                username: $scope.userName,
                password: $scope.passWord,
                firstname: $scope.firstName,
                lastname: $scope.lastName,
                phoneno: $scope.phoneNo,
                email: $scope.userName
            };

            userFactory.registerUser(user).then(function(user) {
                ngToast.create({dismissButton: 'true',
                    dismissOnTimeout: false,
                    content: 'Registration successful. Please log in to proceed.'});

                $location.path('login');
            }, function(res) { console.log(res); });
        };
    }
]);