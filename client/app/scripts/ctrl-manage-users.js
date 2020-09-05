angular.module('appoint')
.controller('CtrlManageUser', ['$scope', 
                               '$modal',
                               'userFactory',

    function ($scope,
              $modal,
              userFactory) {

        'use strict';
        $scope.tabs = [
            {
                "title": "Doctors",
                "content": ""
            },
            {
                "title": "Assistants",
                "content": ""
            }
        ];
        $scope.tabs.activeTab = 0;

        $scope.doctors = null;
        $scope.assistants = null;
        $scope.admins = null;
        $scope.users = null;
        
        $scope.populateData = function() {
            userFactory.getUsers().then(function(users) {
                $scope.doctors = users.doctors;
                $scope.assistants = users.assistants;

                userFactory.getAdmins().then(function(users) {
                    $scope.admins = users;
                    updateUsers();
                });                
            });
        };

        $scope.onTabClicked = function() {
            updateUsers();
        };

        $scope.isAdmin = function(id) {
            if ($scope.tabs.activeTab !== 0)
                return false;

            for (var i = 0; i < $scope.admins.length; ++i) {
                if (id === $scope.admins[i]._id)
                    return true;
            }
            return false;
        };

        var updateUsers = function() {
            if ($scope.tabs.activeTab === 0)
                $scope.users = $scope.doctors.slice();
            else
                $scope.users = $scope.assistants.slice();
        };

        $scope.onAddUser = function() {
            var inputs = {
                searchTerm: null,
                submit: function(result) {
                    var role = "assistant";
                    if ($scope.tabs.activeTab === 0)
                        role = "doctor";
                    userFactory.addUserToHosp(result._id, userFactory.getHospId(), role).then(function(resp) {
                        if ($scope.tabs.activeTab === 0)
                            $scope.doctors.push(resp);
                        else
                            $scope.assistants.push(resp);
                        $scope.users.push(resp);
                    });
                }
            };

            $modal({
                controller: 'CtrlAddUser',
                templateUrl: '../views/search_user.tpl.html',
                resolve: {
                    inputs: function() {
                        return inputs;
                    }
                }
            });                
        };

        $scope.onRemoveUser = function(userId, index) {
            var role = "assistant";
            if ($scope.tabs.activeTab === 0)
                role = "doctor";
            userFactory.removeUserFrmHosp(userId, userFactory.getHospId(), role).then(function(resp) {
                if ($scope.tabs.activeTab === 0)
                    $scope.doctors.splice(index, 1);
                else
                    $scope.assistants.splice(index, 1);
                $scope.users.splice(index, 1);
            });
        };     

        $scope.onMakeAdmin = function(userId, index) {
            userFactory.makeAdmin(userId).then(function(resp) {
                $scope.admins.push($scope.users[index]);
            });
        }; 

        $scope.onRemoveAdmin = function(userId) {
            userFactory.removeAdmin(userId).then(function(resp) {
                for (var i = 0; i < $scope.admins.length; ++i) {
                    if (userId === $scope.admins[i]._id) {
                        $scope.admins.splice(i, 1);
                        break;
                    }
                }
            });
        };        

    }
])

.controller('CtrlAddUser', ['$scope', 
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