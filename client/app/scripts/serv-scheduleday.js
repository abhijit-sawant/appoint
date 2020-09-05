angular.module('appoint')
        .constant('baseURL','https://localhost:3443/')
        .factory('scheduleDayFactory', ['$resource',
                                        'baseURL',
                                        '$cookies',
                                        'userFactory',                                         

        function($resource,
                baseURL,
                $cookies,
                userFactory) {
            'use strict';
        	var scheduleDayFac = {};
  
            var updateTime = function(appointement) {
                var start = new Date();
                start.setTime(appointement.start);
                appointement.start = start;

                var end = new Date();
                end.setTime(appointement.end);
                appointement.end = end; 

                return appointement;
            };

            var fetchAppointements = function(date, docId) {
                var appointements = [];
                var res = $resource(baseURL + 'appointement/date/?docId=' + docId + '&hospId=' + userFactory.getHospId() + 
                    '&year=' + date.getFullYear() + '&month=' + date.getMonth() + '&date=' + date.getDate(), null, {
                    get: {method:'GET', headers:{'x-access-token': userFactory.getToken()}, isArray: true}
                    });
                
                return res.get().$promise.then(function(appointements) {
                    for (var i = 0; i < appointements.length; ++i) {
                        appointements[i] = updateTime(appointements[i]);   
                    }
                    return appointements;
                }, function(resp) {console.log(resp);});
            };

            var fetchAppointementsWeek = function(date, docId) {
                var appointements = [];
                var res = $resource(baseURL + 'appointement/week/?docId=' + docId + '&hospId=' + userFactory.getHospId() + 
                    '&year=' + date.getFullYear() + '&month=' + date.getMonth() + '&date=' + date.getDate(), null, {
                    get: {method:'GET', headers:{'x-access-token': userFactory.getToken()}, isArray: true}
                    });
                
                return res.get().$promise.then(function(appointements) {
                     for (var i = 0; i < appointements.length; ++i) {
                        for (var j = 0; j < appointements[i].data.length; ++j) {
                            appointements[i].data[j] = updateTime(appointements[i].data[j]);   
                        }
                    }
                    return appointements;
                }, function(resp) {console.log(resp);});
            };          

            scheduleDayFac.setSlectedAppointment = function(appointement) {
                if (appointement === null) {
                    $cookies.putObject('appoint_serv-selectedAppointment', appointement, {secure: true});
                }
                else {
                    appointement.start = appointement.start.getTime();
                    appointement.end = appointement.end.getTime();
                    $cookies.putObject('appoint_serv-selectedAppointment', appointement, {secure: true});
                }
            };           

            scheduleDayFac.getSlectedAppointment = function() {
                var selectedAppointment = $cookies.getObject('appoint_serv-selectedAppointment');
                if (selectedAppointment !== null)
                    selectedAppointment = updateTime(selectedAppointment);
                return selectedAppointment;
            };            
        	
        	scheduleDayFac.getAppointements = function(date, docId) {
                return fetchAppointements(date, docId);
        	};

            scheduleDayFac.getAppointementsWeek = function(date, docId) {
                return fetchAppointementsWeek(date, docId);
            }; 

            scheduleDayFac.getAppointementsDays = function(days, docId) {
                var urlDays = '';
                for (var i = 0; i < days.length; ++i) {
                    urlDays += '&day=' + days[i].valueOf();
                }
                var appointements = [];
                var res = $resource(baseURL + 'appointement/days/?docId=' + docId + '&hospId=' + 
                    userFactory.getHospId() + urlDays, null, {
                    get: {method:'GET', headers:{'x-access-token': userFactory.getToken()}, isArray: true}
                    });
                
                return res.get().$promise.then(function(appointements) {
                    for (var i = 0; i < appointements.length; ++i) {
                        for (var j = 0; j < appointements[i].data.length; ++j) {
                            appointements[i].data[j] = updateTime(appointements[i].data[j]);   
                        }
                    }                    
                    return appointements;
                }, function(resp) {console.log(resp);});
            };   


            scheduleDayFac.getNumAppointsDays = function(docId, days) {
                var urlDays = '';
                for (var i = 0; i < days.length; ++i) {
                    urlDays += '&day=' + days[i].valueOf();
                }
                var appointements = [];
                var res = $resource(baseURL + 'appointement/num_appoints_days/?docId=' + docId + '&hospId=' + 
                    userFactory.getHospId() + urlDays, null, {
                    get: {method:'GET', headers:{'x-access-token': userFactory.getToken()}, isArray: true}
                    });
                
                return res.get().$promise.then(function(num_appoints) {
                    return num_appoints;
                }, function(resp) {console.log(resp);});
            };

            scheduleDayFac.getNumAppointsMonth = function(docId, year, month) {
                var res = $resource(baseURL + 'appointement/num_appoints_month/?docId=' + docId + '&hospId=' + userFactory.getHospId() + 
                    '&year=' + year + '&month=' + month, null, {
                    get: {method:'GET', headers:{'x-access-token': userFactory.getToken()}, isArray: true}
                    });
                
                return res.get().$promise.then(function(num_appoints) {
                    return num_appoints;
                }, function(resp) {console.log(resp);});
            };  

            scheduleDayFac.getNumAppointsYear = function(docId, year) {
                var res = $resource(baseURL + 'appointement/num_appoints_year/?docId=' + docId + '&hospId=' + userFactory.getHospId() + 
                    '&year=' + year, null, {
                    get: {method:'GET', headers:{'x-access-token': userFactory.getToken()}, isArray: true}
                    });
                
                return res.get().$promise.then(function(num_appoints) {
                    return num_appoints;
                }, function(resp) {console.log(resp);});
            };                      

        	scheduleDayFac.makeAppointement = function(docId, date, start, end, reason, idPatient) {
                var appointement = {docId: docId, hospId: userFactory.getHospId(), 
                    year: date.getFullYear(), month: date.getMonth(), date: date.getDate(), 
                    start: start.getTime(), end: end.getTime(), 
                    reason: reason, patientId: idPatient, symptom: "", diagnosis: "", prescription: ""};
                var res = $resource(baseURL + 'appointement', null, {
                    save: {method:'POST', headers:{'x-access-token': userFactory.getToken()}}
                    });
                return res.save(appointement).$promise;
        	};

            scheduleDayFac.removeAppointement = function(id, docId) {
                var res = $resource(baseURL + 'appointement/' + id + '?docId=' + docId + '&hospId=' + userFactory.getHospId() , null, {
                    delete: {method:'DELETE', headers:{'x-access-token': userFactory.getToken()}}
                    });

                return res.delete().$promise;                
            };

            scheduleDayFac.editAppointement = function(appointement, docId) {
                var res = $resource(baseURL + 'appointement/' + appointement._id + '?docId=' + docId + '&hospId=' + userFactory.getHospId(), null, {
                    update: {method:'PUT', headers:{'x-access-token': userFactory.getToken()}}
                    });

                appointement.start = appointement.start.getTime();
                appointement.end = appointement.end.getTime();
                return res.update(appointement).$promise.then(function(appointement) {
                    return updateTime(appointement);                     
                }, 
                function(resp) {
                    console.log(resp);
                });
            };            

            scheduleDayFac.rescheduleAppointement = function(appointement, docId) {
                var res = $resource(baseURL + 'appointement/' + appointement._id + '?docId=' + docId + '&hospId=' + userFactory.getHospId(), null, {
                    update: {method:'PUT', headers:{'x-access-token': userFactory.getToken()}}
                    });

                appointement.year = appointement.year;
                appointement.month = appointement.month;
                appointement.date = appointement.date;
                appointement.start = appointement.start.getTime();
                appointement.end = appointement.end.getTime();
                return res.update(appointement).$promise.then(function(appointement) {
                    return updateTime(appointement);                     
                }, 
                function(resp) {
                    console.log(resp);
                });
            };

        	return scheduleDayFac;
}]);

