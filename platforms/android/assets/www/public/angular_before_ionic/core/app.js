function trackDigests(app) {
    app.run(["$rootScope", function ($rootScope) {
        Promise.setScheduler(function (cb) {
            $rootScope.$evalAsync(cb);
        });
    }]);
}

//angular sanitize included in textAngular
var app = angular.module('app', [
    'ngSanitize',
    'ui.bootstrap',
    'toastr',
    'ui.router',
    'ngDialog',
    'LocalStorageModule',
    'angular-loading-bar',
    'ngAnimate',
    'ionic'
]);

//app.config(function ($stateProvider, $urlRouterProvider, $interpolateProvider) {
//    //
//
//    /*symbol to work with express handlebars
//     * */
//    $interpolateProvider.startSymbol('{[{');
//    $interpolateProvider.endSymbol('}]}');
//
//    // For any unmatched url, redirect to /index
//    $urlRouterProvider.when('/home', '/home/welcome');
//    $urlRouterProvider.otherwise("/index");
//
//    $stateProvider
//        .state('index', {
//            url: "/index",
//            templateUrl: "_index.html"
//        })
//        .state('register', {
//            url: "/register",
//            templateUrl: "_create_account.html"
//        })
//        .state('login', {
//            url: "/login",
//            templateUrl: "_sign_in.html"
//        })
//        .state('home', {
//            url: "/home",
//            templateUrl: "_homepage.html"
//        })
//        .state('home.welcome', {
//            url: "/welcome",
//            views: {
//                'controllerCol': {
//                    templateUrl: "_welcome.html"
//                },
//                'map': {
//                    templateUrl: "_main_map.html"
//                }
//            }
//        })
//        .state('home.requestUber', {
//            url: "/requestUber",
//            views: {
//                'controllerCol': {
//                    templateUrl: "_request_uber.html"
//                },
//                'map': {
//                    templateUrl: "_main_map.html"
//                }
//            }
//        })
//        .state('home.rideStatus', {
//            url: "/rideStatus",
//            views: {
//                'controllerCol': {
//                    templateUrl: "_ride_status.html"
//                },
//                'map': {
//                    templateUrl: "_main_map.html"
//                }
//            }
//        })
//        .state('home.priceEstimator', {
//            url: "/estimator",
//            views: {
//                'controllerCol': {
//                    templateUrl: "_price_estimates.html"
//                },
//                'map': {
//                    templateUrl: "_main_map.html"
//                }
//            }
//        })
//        .state('home.connectToUber', {
//            url: "/connect",
//            views: {
//                'controllerCol': {
//                    templateUrl: "_connect_to_uber.html"
//                },
//                'map': {
//                    templateUrl: "_main_map.html"
//                }
//            }
//        });
//});

app.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
});

trackDigests(app);

/*
 * jquery functions
 * */