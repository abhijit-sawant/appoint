angular.module('appoint')
    .controller('CtrlHospital', ['$scope',
                            '$location',
                            'ngToast',
                            'userFactory', 

        function ($scope,
                  $location,
                  ngToast,
                  userFactory) {
            'use strict';

            $scope.userHospitals = null;
            $scope.hospitalName = null;
            $scope.addressLine1 = null;
            $scope.addressLine2 = null;
            $scope.addressCity = null;
            $scope.addressZip = null;
            $scope.addressPhoneNo = null;
            $scope.addressEmail = null;

            $scope.populateData = function() {
                userFactory.getUserInfo().then(function(resp) {
                    $scope.userHospitals = resp.hospIds;
                });
            }; 

            $scope.onHospitalSelected = function(index) {
                if (index > $scope.userHospitals.length) {
                    console.log('onHospitalSelected failed. index out of range ' + index);
                    return;
                }
                userFactory.setHospId($scope.userHospitals[index]._id).then(function(resp) {
                    if (resp.msg) {
                        console.log(resp.msg);
                        return;
                    }
                    $location.path('calendar');
                });                
            };

            $scope.showEmptyMessage = function() {
                if ($scope.userHospitals === null || 
                    $scope.userHospitals.length <= 0)
                    return true;
                return false;
            };

            $scope.showAddressLine2 = function(index) {
                if (index > $scope.userHospitals.length)
                    return false;

                var line = $scope.userHospitals[index].address_line_2;
                if (line === undefined || line === null || line === '')
                    return false;

                return true;
            };

            $scope.onRegisterHospital = function() {
                if ($scope.registerHospForm.$valid !== true)
                    return;

                var hosp = {
                    adminId: userFactory.getUserId(),
                    name: $scope.hospitalName,
                    address_line_1: $scope.addressLine1,
                    city: $scope.addressCity,
                    zip: parseInt($scope.addressZip),
                    phone: $scope.addressPhoneNo
                };
                if ($scope.addressLine2 !== null)
                    hosp.address_line_2 = $scope.addressLine2;
                if ($scope.addressEmail !== null)
                    hosp.email = $scope.addressEmail;

                userFactory.registerHospital(hosp).then(function(hosp) {
                    userFactory.addUserToHosp(userFactory.getUserId(), hosp._id, "doctor").then(function(resp) {
                        ngToast.create({dismissButton: 'true',
                        dismissOnTimeout: false,
                        content: 'Added hospital ' + $scope.hospitalName});
                        $location.path('selecthospital');
                    }, function(resp) { console.log(resp); });
                }, function(resp) { console.log(resp); });
            };
}]);
           