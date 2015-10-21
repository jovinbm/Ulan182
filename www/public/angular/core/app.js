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
    'ionic',
    'ngCordova',
    'ngCordovaOauth'
]);

app.config(function ($stateProvider, $urlRouterProvider, $interpolateProvider) {
    //

    /*symbol to work with express handlebars
     * */
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');

    // For any unmatched url, redirect to /index
    $urlRouterProvider.otherwise("/index");

    $stateProvider
        .state('index', {
            url: "/index",
            views: {
                'main': {
                    templateUrl: "_index.html"
                }
            }
        })
        .state('register', {
            url: "/register",
            views: {
                'main': {
                    templateUrl: "_create_account.html"
                }
            }
        })
        .state('login', {
            url: "/login",
            views: {
                'main': {
                    templateUrl: "_sign_in.html"
                }
            }
        })
        .state('home', {
            url: "/home",
            views: {
                'main': {
                    templateUrl: "_welcome.html"
                }
            }
        })
        .state('priceEstimator', {
            url: "/estimator",
            views: {
                'main': {
                    controller: 'priceEstimateController',
                    templateUrl: "_price_estimates.html"
                }
            }
        })
        .state('requestUber', {
            url: "/requestUber",
            views: {
                'main': {
                    controller: "requestUberController",
                    templateUrl: "_request_uber.html"
                }
            }
        })
        .state('rideStatus', {
            url: "/rideStatus",
            views: {
                'main': {
                    controller: 'uberRideStatusController',
                    templateUrl: "_ride_status.html"
                }
            }
        })
        .state('connectToUber', {
            url: "/connect",
            views: {
                'main': {
                    templateUrl: "_connect_to_uber.html"
                }
            }
        });
});

/*
 * update tokens
 * */
app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(['$q', '$location', '$localstorage', function ($q, $location, $localstorage) {
        return {
            'request': function (config) {
                config.headers = config.headers || {};
                if ($localstorage.get('token')) {
                    config.headers.Authorization = 'Bearer ' + $localstorage.get('token');
                }
                return config;
            }

            , response: function (response) {
                return response || $q.when(response);
            }
        };
    }]);
});

app.run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
});

app.constant("GLOBAL", {
    baseUrl: ''
});

trackDigests(app);