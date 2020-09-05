angular.module('appoint')
.controller('CtrlPatientAdd', ['$scope',
                               'ngToast',
                               'userFactory',
    function($scope,
             ngToast, 
             userFactory) {
        'use strict';
        $scope.isFailed = false;

        $scope.firstName = null;
        $scope.lastName = null;
        $scope.phoneNumber = null;
        $scope.email = null;
        $scope.msgFailed = null;

        $scope.onAdd = function () {
            if ($scope.addPatientForm.$valid !== true)
                return;

            var user = { firstname: $scope.firstName,
                lastname: $scope.lastName,
                phoneno: $scope.phoneNumber,
                role: 'patient'};

            if ($scope.email !== null)
            {
                user.email = $scope.email;
                user.username = user.email;
            }
            else
                user.username = user.phoneno;

            user.password = 'not_registered_' + Math.random().toString();

            userFactory.registerUser(user).then(function(response) {                
                ngToast.create({dismissButton: 'true',
                    dismissOnTimeout: true,
                    content: 'Added patient successfully.'});

                $scope.isFailed = false;
                $scope.$hide();
            },
            function(response) {
                $scope.msgFailed = 'Add pateint failed';
                if (response.data.type && response.data.type == 'userExist') {
                    var msgBit = 'phone number ' + user.phoneno;
                    if (user.email !== null && user.email !== undefined)
                        msgBit = 'email ' + user.email;
                    $scope.msgFailed = 'Patient with ' + msgBit+ ' already exist';
                }
                $scope.isFailed = true;
            });
        }; 

        $scope.onClose = function() {
            $scope.$hide();
        };                              
}]);