app = angular.module('appoint', ['ui.router', 'ui.bootstrap', 'mgcrea.ngStrap', 'ngToast', 'ngResource', 'ngCookies']);

app.config(function($stateProvider, $urlRouterProvider) {
        'use strict';
        $stateProvider
            // route for the home page
            .state('home', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header_home.html',
                    },                    
                    'content': {
                        templateUrl : 'views/home.html',
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }              
                }
            })        
            // route for the log-in page
            .state('login', {
                url:'/login',
                views: {
                    'header': {
                        templateUrl : 'views/header_home.html',
                    },                    
                    'content': {
                        templateUrl : 'views/login.html',
                        controller  : 'CtrlLogIn'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }              
                }
            }) 
            // route for the register page
            .state('register', {
                url:'/register',
                views: {
                    'header': {
                        templateUrl : 'views/header_home.html',
                    },                    
                    'content': {
                        templateUrl : 'views/register.html',
                        controller  : 'CtrlRegister'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }              
                }
            })             
            // route for the select hospital page
            .state('selecthospital', {
                url:'/selecthospital',
                views: {
                    'header': {
                        templateUrl : 'views/header_basic.html',
                    },                    
                    'content': {
                        templateUrl : 'views/select_hospital.html',
                        controller  : 'CtrlHospital'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }                     
                }
            })
            // route for the add hospital page
            .state('registerhospital', {
                url:'/registerhospital',
                views: {
                    'header': {
                        templateUrl : 'views/header_basic.html',
                    },                    
                    'content': {
                        templateUrl : 'views/register_hospital.html',
                        controller  : 'CtrlHospital'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }                     
                }
            }) 
            // route for the calendar page
            .state('app', {
                url:'/calendar',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                    },                    
                    'content': {
                        templateUrl : 'views/calendar.html',
                        controller  : 'CalController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }                     
                }
            })
            // route for the make appointement page
            .state('app.makeappoint', {
                url:'makeappoint',
                views: {
                    'content@': {
                        templateUrl : 'views/make_appoint.tpl.html',
                        controller  : 'CtrlMakeAppoint'
                   }
                }
            })     
            // route for the reschedule appointement page
            .state('app.rescheduleappoint', {
                url:'rescheduleappoint',
                views: {
                    'content@': {
                        templateUrl : 'views/reschedule_appoint.html',
                        controller  : 'CtrlMakeAppoint'
                   }
                }
            }) 
            // route for the edit appointement page
            .state('app.editappoint', {
                url:'editappoint',
                views: {
                    'content@': {
                        templateUrl : 'views/edit_appoint.html',
                        controller  : 'CtrlEditAppoint'
                   }
                }
            })            
            // route for the add patient page
            .state('app.addpatient', {
                url:'addpatient',
                views: {
                    'content@': {
                        templateUrl : 'views/add_patient.html',
                        controller  : 'CtrlPatientAdd'
                   }
                }
            })            
            // route for the settings page
            .state('app.settings', {
                url:'settings',
                views: {
                    'content@': {
                        templateUrl : 'views/settings.html',
                        controller  : 'ScheduleDayController'
                   }
                }
            })            
            // route for the schedule_day page
            .state('app.schedule_day', {
                url:'schedule_day',
                views: {
                    'content@': {
                        templateUrl : 'views/schedule_day.html',
                        controller  : 'ScheduleDayController'
                   }
                }
            })
            // route for the schedule_week page
            .state('app.schedule_week', {
                url:'schedule_week',
                views: {
                    'content@': {
                        templateUrl : 'views/schedule_week.html',
                        controller  : 'ScheduleWeekController'
                   }
                }
            })            
            // route for the manage_users page
            .state('app.manage_users', {
                url:'manage_users',
                views: {
                    'content@': {
                        templateUrl : 'views/manage_users.html',
                        controller  : 'CtrlManageUser'
                   }
                }
            });            
			$urlRouterProvider.otherwise('/');
});

app.run(function($rootScope) {
    $rootScope.$on('$stateChangeSuccess', function() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    });
});            

