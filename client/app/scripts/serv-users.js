angular.module('appoint')
        .constant('baseURL','https://localhost:3443/')
        .factory('userFactory', ['$resource',
        	                     '$cookies',
                                 '$location',
                                 'baseURL',

        function($resource,
        	     $cookies,
                 $location,
        	     baseURL) {
            'use strict';
            
        	var userFac = {};

            var token = null;
            var userId = null;
            var userRole = null;
            var hospId = null;
            var isAdmin = null;

        	userFac.getToken = function() {
        		if (token === null) {
	        		var temp = $cookies.getObject('appoint_user');
	        		if (temp !== null)
	        			token = temp.token;
	        		else
	        			$location.path('/');
	        	}
        		return token;
        	};

            userFac.getUserId = function() {
                if (userId === null) {
                    var temp = $cookies.getObject('appoint_user');
                    if (temp !== null)
                        userId = temp.userId;
                    else {
                        $location.path('/');
                    }
                }
                return userId;
            }; 

            userFac.getUserRole = function() {
                if (userRole === null) {
                    var temp = $cookies.getObject('appoint_user_info_hosp');
                    if (temp !== null)
                        userRole = temp.role;
                    else {
                        $location.path('/');
                    }
                }
                return userRole;
            };            

            userFac.setHospId = function(id) {
                hospId = id;
                $cookies.putObject('appoint_hospid', hospId, {secure: true});
                var res = $resource(baseURL + 'users/info/' + hospId, null, {
                    get: {method:'GET', headers:{'x-access-token': userFac.getToken()}}
                    });
                return res.get().$promise.then(function(resp) {
                    $cookies.putObject('appoint_user_info_hosp', {isAdmin: resp.isAdmin, role:resp.role}, {secure: true});
                    return {};
                }, function(resp) { return ({msg: resp.data.msg}); });             
            };   

            userFac.getHospId = function(id) {
                if (hospId === null) {
                    var temp = $cookies.getObject('appoint_hospid');
                    if (temp !== null)
                        hospId = temp;
                    else {
                        $location.path('selecthospital');
                    }
                }
                return hospId;
            };  

            userFac.isAdmin = function(hospId) {
                if (isAdmin === null) {
                    var temp = $cookies.getObject('appoint_user_info_hosp');
                    if (temp !== null) {
                        isAdmin = temp.isAdmin;
                    }
                    else {
                        isAdmin = false;
                    }
                }
                return isAdmin;
            };          

            userFac.registerUser = function(user) {
                var res = $resource(baseURL + 'users/register', null, {
                    save: {method:'POST'}});
                return res.save(user).$promise;
            };  

            userFac.registerHospital = function(hosp) {
                var res = $resource(baseURL + 'users/register_hospital', null, {
                    save: {method:'POST'}});
                return res.save(hosp).$promise;
            }; 

            userFac.addUserToHosp = function(userId, hospId, role) {
                var res = $resource(baseURL + 'users/add_user_to_hospital', null, {
                    save: {method:'POST', headers:{'x-access-token': userFac.getToken()}}});

                var data = {
                    userId: userId,
                    hospId: hospId,
                    role: role
                };
                return res.save(data).$promise;                
            };

            userFac.removeUserFrmHosp = function(userId, hospId, role) {
                var res = $resource(baseURL + 'users/remove_user_from_hospital?role=' + role + '&userId=' + userId + '&hospId=' + hospId, null, {
                    delete: {method:'DELETE', headers:{'x-access-token': userFac.getToken()}}});

                return res.delete().$promise.then(function(resp) { return resp; }, 
                    function(resp) { console.log(resp); });                
            };            

        	userFac.logIn = function(userName, passWord) {
                var userInfo = {username: userName, password: passWord};
                var res = $resource(baseURL + 'users/login', null, {
                    save: {method:'POST'}});
                return res.save(userInfo).$promise.then(function(response) {
                    var toCache = {token: response.token, userId: response.id};
                	$cookies.putObject('appoint_user', toCache, {secure: true});
                });
        	};

            userFac.logOut = function() {
                var res = $resource(baseURL + 'users/logout', null, {
                    get: {method:'GET', headers:{'x-access-token': userFac.getToken()}}
                    });
                return res.get().$promise.then(function() {
                    $cookies.remove('appoint_user');
                    $cookies.remove('appoint_hospid');
                    $cookies.remove('appoint_user_info_hosp');
                    token = null;
                    userId = null;
                    isAdmin = null;
                });
            };

            userFac.getUserInfo = function() {
                var res = $resource(baseURL + 'users/info', null, {
                    get: {method:'GET', headers:{'x-access-token': userFac.getToken()}}
                    });
                return res.get().$promise;
            };

            userFac.searchUser = function(searchTerm) {
                var data = {searchterm: searchTerm};
                var res = $resource(baseURL + 'users/searchuser', null, {
                    save: {method:'POST', headers:{'x-access-token': userFac.getToken()}, isArray: true}
                });
                return res.save(data).$promise;
            };

            userFac.getDoctors = function() {
                var res = $resource(baseURL + 'users/getdoctors/' + userFac.getHospId(), null, {
                    get: {method: 'GET', headers:{'x-access-token': userFac.getToken()}}
                    });
                return res.get().$promise.then(function(hosp) {
                    return hosp.docIds;
                });
            };

            userFac.getUsers = function() {
                var res = $resource(baseURL + 'users/getusers/' + userFac.getHospId(), null, {
                    get: {method: 'GET', headers:{'x-access-token': userFac.getToken()}}
                    });
                return res.get().$promise.then(function(hosp) {
                    return {doctors: hosp.docIds, assistants: hosp.assistIds};
                }, function(resp) { console.log(resp); });
            };   

            userFac.getAdmins = function() {
                var res = $resource(baseURL + 'users/getadmins/' + userFac.getHospId(), null, {
                    get: {method: 'GET', headers:{'x-access-token': userFac.getToken()}}
                    });
                return res.get().$promise.then(function(hosp) {
                    return hosp.adminIds;
                }, function(resp) { console.log(resp); });
            }; 

            userFac.makeAdmin = function(userId) {
                var res = $resource(baseURL + 'users/makeadmin/', null, {
                    put: {method: 'PUT', headers:{'x-access-token': userFac.getToken()}}
                });
                var data = {hospId: userFac.getHospId(), userId: userId};
                return res.put(data).$promise.then(function(resp) {
                    return resp;
                }, function(resp) { console.log(resp); });
            }; 

            userFac.removeAdmin = function(userId) {
                var res = $resource(baseURL + 'users/removeadmin/', null, {
                    put: {method: 'PUT', headers:{'x-access-token': userFac.getToken()}}
                });
                var data = {hospId: userFac.getHospId(), userId: userId};
                return res.put(data).$promise.then(function(resp) {
                    return resp;
                }, function(resp) { console.log(resp); });
            };                               

        	return userFac;
}]);
