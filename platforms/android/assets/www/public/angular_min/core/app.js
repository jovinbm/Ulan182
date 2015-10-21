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
    baseUrl: 'http://www.pluschat.net/api'
});

trackDigests(app);
angular.module('app')
    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('app')
            .setStorageCookieDomain(document.location.hostname.search("uber") !== -1 ? 'uber.org' : '')
            .setStorageType('localStorage');
    });

angular.module('app')
    .controller('UniversalController',
    ['$filter', '$window', '$location', '$scope', '$rootScope', 'ngDialog', '$anchorScroll', 'localStorageService', '$http', '$state', 'toastr', '$interval', 'service_rideStatus', '$ionicPopup', '$ionicPopover', '$timeout', 'GLOBAL',
        function ($filter, $window, $location, $scope, $rootScope, ngDialog, $anchorScroll, localStorageService, $http, $state, toastr, $interval, service_rideStatus, $ionicPopup, $ionicPopover, $timeout, GLOBAL) {

            $rootScope.main = {

                uberRideRequestStatuses: service_rideStatus.uberRideRequestStatuses,

                classes: {
                    body: 'index'
                },

                userData: null,

                getUserData: function () {
                    return Promise.resolve()
                        .then(function () {
                            return $http.post(GLOBAL.baseUrl + '/getUserData', {})
                                .then(function (resp) {
                                    resp = resp.data;
                                    $rootScope.main.responseStatusHandler(resp);
                                    return resp.userData;
                                })
                                .catch(function (err) {
                                    err = err.data;
                                    $rootScope.main.responseStatusHandler(err);
                                    throw err;
                                })
                        })
                        .then(function (user) {
                            if (user) {
                                $rootScope.main.userData = user;
                            } else {
                                $rootScope.main.userData = null;
                            }
                            return true;
                        })
                        .then(function () {
                            if (!$rootScope.main.userData) {
                                $rootScope.main.changeState('index', null, ['index', 'register', 'login']);
                            } else {
                                $rootScope.main.changeState('home', ['index', 'register', 'login'], null);
                            }
                        })
                        .catch(function (err) {
                            console.log(err);
                            return true;
                        })
                },

                getCurrentState: function () {
                    return $state.current.name;
                },

                changeState: function (toState, ifInArray, ifNotInArray) {
                    var currentState = $rootScope.main.getCurrentState();
                    if (ifInArray) {
                        if (ifInArray.indexOf(currentState) > -1) {
                            $state.go(toState);
                        }
                    } else if (ifNotInArray) {
                        if (ifNotInArray.indexOf(currentState) == -1) {
                            $state.go(toState);
                        }
                    } else if (toState) {
                        $state.go(toState);
                    } else {
                        //do nothing
                        return true;
                    }
                },

                redirectToLogin: function () {
                    $window.location.href = '/notLoggedIn';
                },

                reloadPage: function () {
                    $window.location.reload();
                },

                redirectToHome: function () {
                    $window.location.href = '/';
                },

                redirectToPage: function (path) {
                    $window.location.href = path;
                },

                redirectToPreviousPage: function () {
                    window.location.href = document.referrer;
                },

                responseStatusHandler: function (resp) {
                    $filter('responseFilter')(resp);
                },

                showToast: function (toastType, text) {
                    return $rootScope.main.showIonicAlert('Info', text);
                },

                showIonicAlert: function (heading, content) {
                    return $ionicPopup.alert({
                        title: heading,
                        template: content
                    });
                },

                showIonicJSONAlert: function (data) {
                    $rootScope.main.showIonicAlert('JSON', JSON.stringify(data))
                }

            };

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.main.getUserData();
            });


            /*
             * important, check if user is not connected to uber
             * */
            $scope.$watch(function () {
                return $rootScope.main.userData
            }, function (userData, oldVal) {
                if (userData) {
                    if (userData.uber.access_token == '') {
                        $rootScope.main.changeState('connectToUber');
                    }
                }
            });
        }
    ]);
angular.module('app')
    .directive('uberConnect', ['$rootScope', '$http', '$cordovaOauth', 'GLOBAL',
        function ($rootScope, $http, $cordovaOauth, GLOBAL) {
            return {
                restrict: 'AE',
                link: function ($scope) {
                    $scope.uberConnect = {
                        isBusy: false,
                        status: '',

                        getUberAuthorizationUrl: function () {

                            $scope.uberConnect.isBusy = true;
                            $scope.uberConnect.status = 'Connecting...';

                            return Promise.resolve()
                                .then(function () {
                                    $cordovaOauth.uber('5ZCEhRHb7dPloybTSGa3mojIcRIMBXVg', ['request', 'profile', 'history'], {})
                                        .then(function (result) {
                                            console.log("Response Object -> " + JSON.stringify(result));
                                        }, function (error) {
                                            console.log("Error -> " + error);
                                        });
                                });

                            //return Promise.resolve()
                            //    .then(function () {
                            //        return $http.post(GLOBAL.baseUrl + '/getUberAuthorizationUrl', {})
                            //            .then(function (resp) {
                            //                resp = resp.data;
                            //                $rootScope.main.responseStatusHandler(resp);
                            //                return resp;
                            //            })
                            //            .catch(function (err) {
                            //                err = err.data;
                            //                $rootScope.main.responseStatusHandler(err);
                            //                throw err;
                            //            })
                            //    })
                            //    .then(function (resp) {
                            //        $scope.uberConnect.isBusy = false;
                            //        $rootScope.main.redirectToPage(resp.url);
                            //        return true;
                            //    })
                            //    .catch(function (err) {
                            //        $scope.uberConnect.isBusy = false;
                            //        console.log(err);
                            //        return true;
                            //    })
                        }
                    }
                }
            };
        }])
angular.module('app')
    .controller('createAccountController', ['$rootScope', '$http', function ($rootScope, $http) {
        $rootScope.main.classes.body = 'account-crud';
    }])
    .directive('createAccountScope', ['$rootScope', '$http', '$localstorage', 'GLOBAL', function ($rootScope, $http, $localstorage, GLOBAL) {
        return {
            restrict: 'AE',
            link: function ($scope) {
                $scope.createMain = {
                    isBusy: false
                };

                $scope.registrationDetails = {
                    email: "",
                    firstName: "",
                    lastName: "",
                    username: "",
                    password1: "",
                    password2: ""
                };

                $scope.createAccount = function () {
                    $scope.createMain.isBusy = true;
                    return createAccount($scope.registrationDetails)
                        .then(function () {
                            $scope.createMain.isBusy = false;
                        });
                };

                function createAccount(details) {
                    return $http.post(GLOBAL.baseUrl + '/createAccount', details)
                        .then(function (resp) {
                            resp = resp.data;
                            /*
                             * save the users token
                             * */
                            $localstorage.set('token', resp.token);
                            $rootScope.main.responseStatusHandler(resp);
                            return true;
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            $scope.registrationDetails.password1 = "";
                            $scope.registrationDetails.password2 = "";
                            return true;
                        });
                }
            }
        };
    }]);
angular.module('app')
    .directive('logoutScope', ['$rootScope', '$http', '$localstorage','GLOBAL', function ($rootScope, $http, $localstorage,GLOBAL) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.logout = function () {
                    return Promise.resolve()
                        .then(function () {
                            return $http.post(GLOBAL.baseUrl + '/logoutClient', {}).then(function (resp) {
                                console.log(resp);
                                resp = resp.data;
                                /*
                                 * delete token
                                 * */
                                $localstorage.set('token', '');
                                $rootScope.main.responseStatusHandler(resp);
                                $rootScope.main.userData = null;
                                return true;
                            })
                                .catch(function (err) {
                                    err = err.data;
                                    $rootScope.main.responseStatusHandler(err);
                                    return true;
                                })
                        })
                        .catch(function (err) {
                            console.log(err);
                            return true;
                        })
                }
            }
        };
    }]);
angular.module('app')
    .controller('signInController', ['$rootScope', '$http', 'GLOBAL', function ($rootScope, $http, GLOBAL) {
        $rootScope.main.classes.body = 'account-crud';
    }])
    .directive('signInScope', ['$rootScope', '$http', '$localstorage', 'GLOBAL', function ($rootScope, $http, $localstorage, GLOBAL) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.signInMain = {
                    isBusy: false
                };

                $scope.loginFormModel = {
                    username: "",
                    password: ""
                };

                $scope.submitLocalLoginForm = function () {
                    $scope.signInMain.isBusy = true;
                    return localUserLogin($scope.loginFormModel)
                        .then(function () {
                            $scope.signInMain.isBusy = false;
                        });
                };

                function localUserLogin(loginData) {
                    return Promise.resolve()
                        .then(function () {
                            return $http.post(GLOBAL.baseUrl + '/localUserLogin', loginData);
                        })
                        .then(function (resp) {
                            resp = resp.data;
                            /*
                             * save the users token before redirecting
                             * */
                            $localstorage.set('token', resp.token);
                            $rootScope.main.responseStatusHandler(resp);
                            return true;
                        })
                        .catch(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                            err = err.data;
                            $scope.loginFormModel.password = "";
                            $rootScope.main.responseStatusHandler(err);
                            return true;
                        });
                }
            }
        };
    }]);
angular.module('app')
    .controller('indexController', ['$rootScope', '$http', function ($rootScope, $http) {
        $rootScope.main.classes.body = 'index';
    }])
    .directive('indexnScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {
            }
        };
    }]);
angular.module('app')
    .controller('homeCoreController', ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {
        $rootScope.main.classes.body = 'homepage';

    }])
    .factory('$localstorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }])
    .factory("service_uberProducts", ['$interval', '$rootScope', '$http', '$timeout', 'GLOBAL', function ($interval, $rootScope, $http, $timeout, GLOBAL) {
        /*
         * polls the available products etc
         * */

        var format = {
            "products": [
                {
                    "capacity": 4,
                    "description": "The low-cost Uber",
                    "price_details": {
                        "distance_unit": "mile",
                        "cost_per_minute": 0.26,
                        "service_fees": [
                            {
                                "fee": 1.0,
                                "name": "Safe Rides Fee"
                            }
                        ],
                        "minimum": 5.0,
                        "cost_per_distance": 1.3,
                        "base": 2.2,
                        "cancellation_fee": 5.0,
                        "currency_code": "USD"
                    },
                    "image": "http://d1a3f4spazzrp4.cloudfront.net/car.jpg",
                    "display_name": "uberX",
                    "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d"
                }
            ]
        };
        var TimeoutError = Promise.TimeoutError;

        var products = null;

        function getProducts(lat, lng) {

            /*
             * either returns products or []
             * */

            if (!$rootScope.main || !$rootScope.main.userData) return [];

            return Promise.resolve()
                .then(function () {

                    if (lat && lng) {
                        return true;
                    } else {
                        throw {
                            code: 600
                        };
                    }
                })
                .timeout(55000) // timeout in 55 secs
                .then(function () {
                    return $http.post(GLOBAL.baseUrl + '/getProducts', {
                        latitude: lat,
                        longitude: lng
                    })
                        .then(function (resp) {
                            resp = resp.data;
                            $rootScope.main.responseStatusHandler(resp);
                            return resp;
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            throw err;
                        })
                })
                .then(function (resp) {
                    products = resp.obj.products;
                    return resp.obj.products;
                })
                .catch(function (e) {
                    if (e.code === 600) {
                        $rootScope.main.showToast('warning', 'We could not determine your precise location to list the available products in your area');
                        products = [];
                        return [];
                    } else {
                        throw e
                    }
                })
                .catch(TimeoutError, function (e) {
                    $rootScope.main.showToast('warning', 'Failed to get time estimates. Please check your internet connection.');
                    products = [];
                    return [];
                })
                .catch(function (err) {
                    console.log(err);
                    products = [];
                    return [];
                })
        }

        return {
            getProducts: getProducts, //isFunction
            products: function () {
                return products;
            }
        };
    }])
    .factory("service_uberPrices", ['$interval', '$rootScope', '$http', 'GLOBAL', function ($interval, $rootScope, $http, GLOBAL) {
        /*
         * polls the available products, estimates etc
         * */

        var format = {
            "prices": [
                {
                    "product_id": "08f17084-23fd-4103-aa3e-9b660223934b",
                    "currency_code": "USD",
                    "display_name": "UberBLACK",
                    "estimate": "$23-29",
                    "low_estimate": 23,
                    "high_estimate": 29,
                    "surge_multiplier": 1,
                    "duration": 640,
                    "distance": 5.34
                }
            ]
        };
        var TimeoutError = Promise.TimeoutError;

        var priceEstimateArray = null;

        function getPriceEstimates(start_lat, start_lng, end_lat, end_lng) {

            /*
             * either returns array or []
             * */

            if (!$rootScope.main || !$rootScope.main.userData) return [];

            return Promise.resolve()
                .then(function () {

                    if (start_lat && start_lng && end_lat && end_lng) {
                        return true;
                    } else {
                        throw {
                            code: 600
                        };
                    }
                })
                .timeout(55000) // timeout in 55 secs
                .then(function () {
                    return $http.post(GLOBAL.baseUrl + '/getPriceEstimate', {
                        start_latitude: start_lat,
                        start_longitude: start_lng,
                        end_latitude: end_lat,
                        end_longitude: end_lng
                    })
                        .then(function (resp) {
                            resp = resp.data;
                            $rootScope.main.responseStatusHandler(resp);
                            return resp;
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            throw err;
                        })
                })
                .then(function (resp) {
                    priceEstimateArray = resp.obj.prices;
                    return resp.obj.prices;
                })
                .catch(function (e) {
                    if (e.code === 600) {
                        $rootScope.main.showToast('warning', 'Some fields are missing');
                        priceEstimateArray = [];
                        return [];
                    } else {
                        throw e
                    }
                })
                .catch(TimeoutError, function (e) {
                    $rootScope.main.showToast('warning', 'Failed to get time estimates. Please check your internet connection.');
                    priceEstimateArray = [];
                    return [];
                })
                .catch(function (err) {
                    console.log(err);
                    priceEstimateArray = [];
                    return [];
                });
        }

        return {
            getPriceEstimates: getPriceEstimates, //isFunction
            priceEstimateArray: function () {
                return priceEstimateArray;
            }
        };
    }])
    .factory("service_uberTimeEstimates", ['$interval', '$rootScope', '$http', 'GLOBAL', function ($interval, $rootScope, $http, GLOBAL) {
        /*
         * pickup time estimates for various products etc
         * */

        var format = {
            "times": [
                {
                    "product_id": "5f41547d-805d-4207-a297-51c571cf2a8c",
                    "display_name": "UberBLACK",
                    "estimate": 410
                }
            ]
        };
        var TimeoutError = Promise.TimeoutError;

        var timeEstimateArray = null;

        function getTimeEstimates(start_lat, start_lng) {

            /*
             * either returns array or []
             * */

            if (!$rootScope.main || !$rootScope.main.userData) return [];

            return Promise.resolve()
                .then(function () {

                    if (start_lat && start_lng) {
                        return true;
                    } else {
                        throw {
                            code: 600
                        };
                    }
                })
                .timeout(55000) // timeout in 55 secs
                .then(function () {
                    return $http.post(GLOBAL.baseUrl + '/getTimeEstimate', {
                        start_latitude: start_lat,
                        start_longitude: start_lng
                    })
                        .then(function (resp) {
                            resp = resp.data;
                            $rootScope.main.responseStatusHandler(resp);
                            return resp;
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            throw err;
                        })
                })
                .then(function (resp) {
                    timeEstimateArray = resp.obj.times;
                    return resp.obj.times;
                })
                .catch(function (e) {
                    if (e.code === 600) {
                        $rootScope.main.showToast('warning', 'Some fields are missing');
                        timeEstimateArray = [];
                        return [];
                    } else {
                        throw e
                    }
                })
                .catch(TimeoutError, function (e) {
                    $rootScope.main.showToast('warning', 'Failed to get time estimates. Please check your internet connection.');
                    timeEstimateArray = [];
                    return [];
                })
                .catch(function (err) {
                    console.log(err);
                    timeEstimateArray = [];
                    return [];
                });
        }

        return {
            getTimeEstimates: getTimeEstimates, //isFunction
            timeEstimateArray: function () {
                return timeEstimateArray;
            }
        };
    }])
    .factory("service_rideStatus", ['$interval', '$rootScope', '$http', 'GLOBAL', function ($interval, $rootScope, $http, GLOBAL) {
        /*
         * polls the ride status
         * */

        var format = {
            "status": "accepted",
            "driver": {
                "phone_number": "(555)555-5555",
                "rating": 5,
                "picture_url": "https:\/\/d1w2poirtb3as9.cloudfront.net\/img.jpeg",
                "name": "Bob"
            },
            "eta": 4,
            "location": {
                "latitude": 37.776033,
                "longitude": -122.418143,
                "bearing": 33
            },
            "vehicle": {
                "make": "Bugatti",
                "model": "Veyron",
                "license_plate": "I<3Uber",
                "picture_url": "https:\/\/d1w2poirtb3as9.cloudfront.net\/car.jpeg"
            },
            "surge_multiplier": 1.0,
            "request_id": "b2205127-a334-4df4-b1ba-fc9f28f56c96",
            //cojoined details in server
            "mapDetails": {
                "request_id": "b5512127-a134-4bf4-b1ba-fe9f48f56d9d",
                "href": "https://trip.uber.com/abc123"
            },
            "lastRide": "**last ride details from database"
        };

        var TimeoutError = Promise.TimeoutError;

        var rideStatus = null;

        var uberRideRequestStatuses = {
            processing: "Processing",
            no_drivers_available: 'No drivers available',
            accepted: 'Accepted',
            arriving: 'Arriving',
            in_progress: 'In progress',
            driver_canceled: 'Driver canceled',
            rider_canceled: 'Rider canceled',
            completed: 'Completed'
        };


        function getUberRideStatus() {

            if (!$rootScope.main || !$rootScope.main.userData) return [];

            /*
             * either returns array or null**
             * */

            return Promise.resolve()
                .timeout(8000) // timeout in 13 secs
                .then(function () {
                    return $http.post(GLOBAL.baseUrl + '/getRideStatus', {})
                        .then(function (resp) {
                            resp = resp.data;
                            $rootScope.main.responseStatusHandler(resp);
                            return resp;
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            throw err;
                        })
                })
                .then(function (resp) {
                    var rStatus = resp.obj;
                    /*
                     * put a rating array for the ng-repeat stars
                     * */
                    if (!rStatus) {
                        rideStatus = null;
                        return true;
                    }

                    if (rStatus.driver) {
                        rStatus.driver.ratingArray = new Array(Math.ceil(rStatus.driver.rating));
                    }
                    rideStatus = rStatus;
                    return rideStatus;
                })
                .catch(function (e) {
                    if (e.code === 600) {
                        $rootScope.main.showToast('warning', 'Some fields are missing');
                        //don't change the ride status
                        return rideStatus;
                    } else {
                        throw e
                    }
                })
                .catch(TimeoutError, function (e) {
                    $rootScope.main.showToast('warning', 'Failed to get time estimates. Please check your internet connection.');
                    //don't change the ride status
                    return rideStatus;
                })
                .catch(function (err) {
                    console.log(err);
                    return rideStatus;
                })
                .then(function () {
                    checkUberRide();
                });
        }

        $interval(function () {
            getUberRideStatus();
        }, 10000); //update every 15 secs
        getUberRideStatus();

        /*
         * function checks if the user has requested an uber, if so, it forces the user to remain in the requestUber state
         * */
        function checkUberRide() {
            if (rideStatus) {
                $rootScope.main.changeState('rideStatus', null, ['rideStatus']);
            }
        }

        $rootScope.$on('$stateChangeSuccess', function () {
            if (rideStatus) {
                $rootScope.main.changeState('rideStatus', null, ['rideStatus']);
            }
        });

        return {
            rideStatus: function () {
                return rideStatus
            },
            getRideStatus: function () {
                return getUberRideStatus();
            },
            uberRideRequestStatuses: uberRideRequestStatuses
        };
    }]);
angular.module('app')
    .directive('locationSearchBox', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attr) {

                $scope.lat = angular.element($element.find('.details input.lat')).val();
                $scope.lng = angular.element($element.find('.details input.lng')).val();
                $scope.formatted_address = angular.element($element.find('.details input.formatted_address')).val();
                /*
                 * auto complete for the input.geoFields
                 * */
                angular.element($element.find('input.geoField')).geocomplete({
                    details: angular.element($element.find('.details'))
                })
                    .bind("geocode:result", function () {
                        $scope.lat = angular.element($element.find('.details input.lat')).val();
                        $scope.lng = angular.element($element.find('.details input.lng')).val();
                        $scope.formatted_address = angular.element($element.find('.details input.formatted_address')).val();

                        $scope.$apply($attr['locationUpdate']);
                    });
            }
        };
    }]);
angular.module('app')
    .controller('mapController', ['$rootScope', '$scope', '$http', '$interval', '$timeout',
        function ($rootScope, $scope, $http, $interval, $timeout) {

            function resizeMap() {
                angular.element("#map").css({
                    "height": angular.element(window).height(),
                    "margin": 0,
                    "padding-left": 0
                });
            }

            angular.element(window).resize(function () {
                resizeMap();
            });

            resizeMap();


            GMaps.prototype._getMyPosition = function (map) {
                if (map._myLocation.lat && map._myLocation.lng) {
                    return {
                        lat: map._myLocation.lat,
                        lng: map._myLocation.lng
                    }
                } else {
                    return Promise.resolve()
                        .then(function () {
                            return new Promise(function (resolve, reject) {
                                GMaps.geolocate({
                                    success: function (position) {
                                        map._myLocation.lat = position.coords.latitude;
                                        map._myLocation.lng = position.coords.longitude;
                                        resolve({
                                            lat: map._myLocation.lat,
                                            lng: map._myLocation.lng
                                        });
                                    },
                                    error: function (error) {
                                        $rootScope.main.showToast('warning', 'Geolocation failed');
                                        console.log(error);
                                        resolve(null)
                                    },
                                    not_supported: function () {
                                        $rootScope.main.showToast('warning', 'Your browser does not support geolocation');
                                        resolve(null)
                                    }
                                });
                            })
                        })
                }
            };


            GMaps.prototype._updateMyPosition = function (map) {
                /*
                 * if userLocation is found, the universalController object is updated with the user location
                 * */
                return new Promise(function (resolve, reject) {
                    GMaps.geolocate({
                        success: function (position) {
                            map._myLocation.lat = position.coords.latitude;
                            map._myLocation.lng = position.coords.longitude;
                            resolve(true);
                        },
                        error: function (error) {
                            console.log(error);
                            $rootScope.main.showToast('warning', 'We could not update your location...');
                            resolve(true);
                        }
                    });
                })
            };

            GMaps.prototype._myLocation = {
                lat: null,
                lng: null
            };

            GMaps.prototype._addMarker = function (lat, lng, title) {
                return this.addMarker({
                    lat: lat,
                    lng: lng,
                    title: title || ''
                });
            };

            GMaps.prototype._addInfoWindowMarker = function (lat, lng, title) {
                return this.addMarker({
                    lat: lat,
                    lng: lng,
                    infoWindow: {
                        content: '<p>' + title + '</p>'
                    }
                });
            };

            GMaps.prototype._userMarker = null;
            GMaps.prototype._userInfoWindowMarker = null;

            GMaps.prototype._addUserMarker = function () {
                this._userMarker = this.addMarker({
                    lat: $rootScope.map._myLocation.lat,
                    lng: $rootScope.map._myLocation.lat,
                    title: ''
                });

                return this._userMarker
            };

            GMaps.prototype._addUserInfoWindowMarker = function (title) {
                this._userInfoWindowMarker = this.addMarker({
                    lat: $rootScope.map._myLocation.lat,
                    lng: $rootScope.map._myLocation.lat,
                    infoWindow: {
                        content: '<p>' + title + '</p>'
                    }
                });

                return this._userInfoWindowMarker
            };

            GMaps.prototype._moveMarker = function (marker, lat, lng) {
                marker.setPosition(new google.maps.LatLng(lat, lng));
            };

            GMaps.prototype._updateUserMarker = function () {
                if (!this._userMarker) {
                    this._addUserMarker()
                } else {
                    this._moveMarker(this._userMarker, this._myLocation.lat, this._myLocation.lng);
                }
            };

            GMaps.prototype._updateUserInfoWindowMarker = function (title) {
                if (!this._userInfoWindowMarker) {
                    this._addUserInfoWindowMarker(title)
                } else {
                    this._moveMarker(this._userInfoWindowMarker, this._myLocation.lat, this._myLocation.lng);
                }
            };

            GMaps.prototype._removeMarker = function (marker) {
                marker.setMap(null);
            };

            GMaps.prototype._removeAllPresentMarkers = function () {
                this.removeMarkers();
            };

            GMaps.prototype._setCenter = function (lat, lng) {
                this.setCenter(lat, lng);
            };

            GMaps.prototype._setCenterToMe = function () {
                if (this._myLocation.lat && this._myLocation.lng) {
                    this.setCenter(this._myLocation.lat, this._myLocation.lng);
                }
            };

            GMaps.prototype._drawRoute = function (originArr, destArr) {
                if (!originArr || !destArr) return;
                if (originArr.length < 2 || destArr.length < 2) return;
                this.cleanRoute();
                this.removeMarkers();

                this.addMarker({lat: originArr[0], lng: originArr[1]});
                this.addMarker({lat: destArr[0], lng: destArr[1]});

                this.drawRoute({
                    origin: originArr,
                    destination: destArr,
                    travelMode: 'driving',
                    strokeColor: '#09091A',
                    strokeOpacity: 0.6,
                    strokeWeight: 6
                });
            };

            $rootScope.map = new GMaps({
                div: '#map',
                lat: -12.043333,
                lng: -77.028333
            });

            /*
             * prepare functions that will update stuff, wait for 3 secs
             * */
            $timeout(function () {

                resizeMap();

                $rootScope.map._updateMyPosition($rootScope.map)
                    .then(function () {
                        $rootScope.map._setCenter($rootScope.map._myLocation.lat, $rootScope.map._myLocation.lng);
                        $rootScope.map._addUserMarker($rootScope.map._myLocation.lat, $rootScope.map._myLocation.lng);
                    });

                $scope.$watch(function () {
                    return $rootScope.map._myLocation.lat;
                }, function () {
                    if ($rootScope.map._userMarker) {
                        $rootScope.map._moveMarker($rootScope.map._userMarker, $rootScope.map._myLocation.lat, $rootScope.map._myLocation.lng);
                    }
                });

                $interval(function () {
                    if ($rootScope.map._updateMyPosition) {
                        $rootScope.map._updateMyPosition($rootScope.map);
                    }
                }, 10000); //update every 10 secs


                /*
                 * refresh on resize and state change
                 * */
                //resize event
                $(window).resize(function () {
                    $rootScope.map.refresh();
                });

            }, 3000);

        }]);
angular.module('app')
    .controller('priceEstimateController', ['$rootScope', '$scope', '$http', '$ionicPopover', '$ionicSlideBoxDelegate', function ($rootScope, $scope, $http, $ionicPopover, $ionicSlideBoxDelegate) {

        $rootScope.main.classes.body = 'priceEstimate';

        /*
         * prepare the results popover
         * */
        $scope.priceEstimatorCtrlMain = {
            /*
             * priceEstimateArray contains the data obtained from price estimates
             * including the types of cars available
             * distance etc,
             *
             * updated when start/end location is chosen
             * */
            priceEstimateArray: [],
            showEstimates: false
        };

        /*
         * managing the slides
         * */

        $scope.goToSlide = function (index) {
            $ionicSlideBoxDelegate.slide(parseInt(index));
        };
        $scope.nextSlide = function (index) {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previousSlide = function (index) {
            $ionicSlideBoxDelegate.previous();
        };
    }])
    .directive('priceEstimator', ['$rootScope', '$http', 'service_uberPrices', function ($rootScope, $http, service_uberPrices) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attr) {

                $scope.priceEstimator = {
                    isBusy: false,
                    status: '',

                    start_latitude: '',
                    start_longitude: '',
                    start_formatted_address: '',
                    end_latitude: '',
                    end_longitude: '',
                    end_formatted_address: '',

                    getPriceEstimates: function () {

                        /*
                         * these estimates should be for the whole journey
                         * */
                        if ($scope.priceEstimator.start_latitude && $scope.priceEstimator.start_longitude && $scope.priceEstimator.end_latitude && $scope.priceEstimator.end_longitude) {

                            $scope.priceEstimator.isBusy = true;
                            $scope.priceEstimator.status = 'Calculating...';

                            return Promise.resolve()
                                .then(function () {
                                    return service_uberPrices.getPriceEstimates($scope.priceEstimator.start_latitude, $scope.priceEstimator.start_longitude, $scope.priceEstimator.end_latitude, $scope.priceEstimator.end_longitude)
                                })
                                .then(function (arr) {
                                    $scope.priceEstimatorCtrlMain.priceEstimateArray = arr;
                                    $scope.priceEstimator.isBusy = false;
                                    /*
                                     * show the estimates
                                     * */
                                    $scope.priceEstimatorCtrlMain.showEstimates = true;
                                    $scope.goToSlide(0);
                                    return true;
                                })
                                .catch(function (err) {
                                    $scope.priceEstimator.isBusy = false;
                                    console.log(err);
                                    return true;
                                });

                        }
                    }
                };

                $scope.updateStartLocation = function (lat, lng, formatted_address) {
                    lat = parseFloat(lat).toFixed(10);
                    lng = parseFloat(lng).toFixed(10);

                    if (formatted_address) {
                        formatted_address = formatted_address.toString();
                    }

                    if (lat && lng) {
                        $scope.priceEstimator.start_latitude = lat;
                        $scope.priceEstimator.start_longitude = lng;
                        $scope.priceEstimator.start_formatted_address = formatted_address;

                        $rootScope.map._addMarker(lat, lng, formatted_address);
                        $rootScope.map._setCenter(lat, lng);
                        $scope.drawRoute();
                    }
                };

                $scope.updateEndLocation = function (lat, lng, formatted_address) {
                    lat = parseFloat(lat).toFixed(10);
                    lng = parseFloat(lng).toFixed(10);

                    if (formatted_address) {
                        formatted_address = formatted_address.toString();
                    }

                    if (lat && lng) {
                        $scope.priceEstimator.end_latitude = lat;
                        $scope.priceEstimator.end_longitude = lng;
                        $scope.priceEstimator.end_formatted_address = formatted_address;

                        $rootScope.map._addMarker(lat, lng, formatted_address);
                        $scope.drawRoute();
                    }
                };

                $scope.drawRoute = function () {
                    if ($scope.priceEstimator.start_latitude && $scope.priceEstimator.end_latitude) {
                        $rootScope.map._setCenter($scope.priceEstimator.start_latitude, $scope.priceEstimator.start_longitude);
                        $rootScope.map._drawRoute([$scope.priceEstimator.start_latitude, $scope.priceEstimator.start_longitude], [$scope.priceEstimator.end_latitude, $scope.priceEstimator.end_longitude])
                    }
                };

                $scope.startAtMyLocation = function () {
                    return Promise.resolve()
                        .then(function () {
                            if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                            } else {
                                return $rootScope.map._getMyPosition($rootScope.map)
                                    .then(function () {
                                        if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                            return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                                        } else {
                                            $rootScope.main.showToast('warning', 'Could not find your position');
                                            return null;
                                        }
                                    })
                            }
                        })
                        .then(function (array) {
                            if (array) {
                                $scope.priceEstimator.start_latitude = array[0];
                                $scope.priceEstimator.start_longitude = array[1]
                            } else {
                                //do nothing
                            }
                        })
                        .catch(function (e) {
                            console.log(e);
                            $rootScope.main.showToast('warning', 'An error occurred while trying to pin point your location');
                        });
                };

                $scope.endAtMyLocation = function () {
                    return Promise.resolve()
                        .then(function () {
                            if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                            } else {
                                return $rootScope.map._getMyPosition($rootScope.map)
                                    .then(function () {
                                        if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                            return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                                        } else {
                                            $rootScope.main.showToast('warning', 'Could not find your position');
                                            return null;
                                        }
                                    })
                            }
                        })
                        .then(function (array) {
                            if (array) {
                                $scope.priceEstimator.end_latitude = array[0];
                                $scope.priceEstimator.end_longitude = array[1]
                            } else {
                                //do nothing
                            }
                        })
                        .catch(function (e) {
                            console.log(e);
                            $rootScope.main.showToast('warning', 'An error occurred while trying to pin point your location');
                        });
                };
            }
        };
    }]);
angular.module('app')
    .controller('requestUberController', ['$rootScope', '$scope', '$http', '$ionicSlideBoxDelegate', function ($rootScope, $scope, $http, $ionicSlideBoxDelegate) {

        $rootScope.main.classes.body = 'requestUber';

        $scope.requestUberControllerMain = {

            /*
             * priceEstimateArray contains the data obtained from price estimates
             * including the types of cars available
             * distance etc
             * */
            priceEstimateArray: [],

            /*
             * timeEstimateArray contains the data obtained from time estimates
             * */
            timeEstimateArray: [],

            /*
             * all uber products available in area, update when start location is selected
             * */
            products: [],

            showStatus: false
        };

        /*
         * managing the slides
         * */

        $scope.goToSlide = function (index) {
            $ionicSlideBoxDelegate.slide(parseInt(index));
        };
        $scope.nextSlide = function (index) {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previousSlide = function (index) {
            $ionicSlideBoxDelegate.previous();
        };

    }])
    .directive('requestUberDirective',
    ['$rootScope', '$http', '$interval', 'service_uberProducts', 'service_uberPrices', 'service_uberTimeEstimates', 'service_rideStatus', 'GLOBAL',
        function ($rootScope, $http, $interval, service_uberProducts, service_uberPrices, service_uberTimeEstimates, service_rideStatus, GLOBAL) {
            return {
                restrict: 'AE',
                link: function ($scope, $element, $attr) {

                    $scope.requestUberMain = {
                        isBusy: false,
                        status: '',

                        start_latitude: '',
                        start_longitude: '',
                        start_formatted_address: '',
                        end_latitude: '',
                        end_longitude: '',
                        end_formatted_address: '',
                        products: [],

                        product_id: '',
                        selectedProductPriceEstimate: {}, //holds the selected products price estimates and so forth
                        selectedProduct: {}, // holds the selected product

                        changeProductId: function (newId, product_display_name) {
                            if (newId) {

                                $scope.requestUberMain.product_id = newId;

                                //get the selected product
                                $scope.requestUberControllerMain.products.forEach(function (product) {
                                    if (product.product_id == newId) {
                                        $scope.requestUberMain.selectedProduct = product;
                                    }
                                });


                                $scope.requestUberControllerMain.priceEstimateArray.forEach(function (product) {
                                    /*
                                     * since product_ids are most of the times different, here we are
                                     * using their names to lower case
                                     * */
                                    if (product.localized_display_name.toLowerCase() == product_display_name.toLowerCase()) {
                                        $scope.requestUberMain.selectedProductPriceEstimate = product;
                                    }
                                });

                                /*
                                 * put in the estimates from the timeEstimateArray
                                 * */
                                $scope.requestUberControllerMain.timeEstimateArray.forEach(function (product) {
                                    /*
                                     * since product_ids are most of the times different, here we are
                                     * using their names to lower case
                                     * */
                                    if (product.display_name.toLowerCase() == product_display_name.toLowerCase()) {
                                        $scope.requestUberMain.selectedProduct.estimate = Math.ceil(product.estimate / 60);
                                    }
                                });
                            }
                        },

                        requestUber: function () {

                            $scope.requestUberMain.isBusy = true;
                            $scope.requestUberMain.status = 'Requesting...';

                            return Promise.resolve()
                                .then(function () {
                                    if ($scope.requestUberMain.start_latitude && $scope.requestUberMain.start_longitude && $scope.requestUberMain.end_latitude && $scope.requestUberMain.end_longitude && $scope.requestUberMain.product_id) {
                                        return true;
                                    } else {
                                        throw {
                                            code: 600
                                        };
                                    }
                                })
                                .then(function () {
                                    return $http.post(GLOBAL.baseUrl + '/requestUber', {
                                        start_latitude: $scope.requestUberMain.start_latitude,
                                        start_longitude: $scope.requestUberMain.start_longitude,
                                        end_latitude: $scope.requestUberMain.end_latitude,
                                        end_longitude: $scope.requestUberMain.end_longitude,
                                        product_id: $scope.requestUberMain.product_id
                                    })
                                        .then(function (resp) {
                                            resp = resp.data;
                                            $rootScope.main.responseStatusHandler(resp);
                                            return resp;
                                        })
                                        .catch(function (err) {
                                            err = err.data;
                                            $rootScope.main.responseStatusHandler(err);
                                            throw err;
                                        })
                                })
                                .then(function (resp) {
                                    $scope.requestUberMain.isBusy = false;
                                    /*
                                     * check the ride status
                                     * */
                                    service_rideStatus.getRideStatus();
                                    return true;
                                })
                                .catch(function (e) {
                                    if (e.code === 600) {
                                        $rootScope.main.showToast('warning', 'Some fields are missing');
                                    } else {
                                        throw e
                                    }
                                    $scope.requestUberMain.isBusy = false;
                                    return true;
                                })
                                .catch(function (err) {
                                    $scope.requestUberMain.isBusy = false;
                                    console.log(err);
                                    return true;
                                })
                        },

                        getPriceEstimates: function () {

                            /*
                             * these estimates should be for the whole journey
                             * */
                            if ($scope.requestUberMain.start_latitude && $scope.requestUberMain.start_longitude && $scope.requestUberMain.end_latitude && $scope.requestUberMain.end_longitude) {

                                $scope.requestUberMain.isBusy = true;
                                $scope.requestUberMain.status = 'Getting cost estimates...';

                                return Promise.resolve()
                                    .then(function () {
                                        return service_uberPrices.getPriceEstimates($scope.requestUberMain.start_latitude, $scope.requestUberMain.start_longitude, $scope.requestUberMain.end_latitude, $scope.requestUberMain.end_longitude)
                                    })
                                    .then(function (arr) {
                                        $scope.requestUberControllerMain.priceEstimateArray = arr;
                                        $scope.requestUberMain.isBusy = false;
                                        return true;
                                    })
                                    .catch(function (err) {
                                        $scope.requestUberMain.isBusy = false;
                                        console.log(err);
                                        return true;
                                    });

                            }
                        },

                        updateTimeEstimates: function () {
                            if ($scope.requestUberMain.start_latitude && $scope.requestUberMain.start_longitude) {
                                console.log('Updating all eta');
                                Promise.resolve()
                                    .then(function () {
                                        return service_uberTimeEstimates.getTimeEstimates($scope.requestUberMain.start_latitude, $scope.requestUberMain.start_longitude)
                                            .then(function (arr) {
                                                $scope.requestUberControllerMain.timeEstimateArray = arr;
                                                return true;
                                            })
                                    })
                            }
                        }
                    };

                    /*
                     * update the pickup times every 60 mins - uber api
                     * */
                    $interval(function () {
                        $scope.requestUberMain.updateTimeEstimates();
                    }, 60000);
                    $scope.requestUberMain.updateTimeEstimates();

                    $scope.updateStartLocation = function (lat, lng, formatted_address) {
                        lat = parseFloat(lat).toFixed(10);
                        lng = parseFloat(lng).toFixed(10);

                        if (formatted_address) {
                            formatted_address = formatted_address.toString();
                        }

                        if (lat && lng) {
                            $scope.requestUberMain.start_latitude = lat;
                            $scope.requestUberMain.start_longitude = lng;
                            $scope.requestUberMain.start_formatted_address = formatted_address;

                            $rootScope.map._addMarker(lat, lng, formatted_address);
                            $rootScope.map._setCenter(lat, lng);
                            $scope.drawRoute();

                            /*
                             * update the products to the new location
                             * PRODUCTS ARE ONLY UPDATED FOR THE PICKUP LOCATION
                             * */
                            Promise.resolve()
                                .then(function () {
                                    return service_uberProducts.getProducts(lat, lng)
                                        .then(function (products) {
                                            $scope.requestUberControllerMain.products = products;
                                            return true;
                                        })
                                });

                            /*
                             * update the prices
                             * */
                            $scope.requestUberMain.getPriceEstimates();

                            /*
                             * update the etas for the start location only
                             * */
                            $scope.requestUberMain.updateTimeEstimates();
                        }
                    };

                    $scope.updateEndLocation = function (lat, lng, formatted_address) {
                        lat = parseFloat(lat).toFixed(10);
                        lng = parseFloat(lng).toFixed(10);

                        if (formatted_address) {
                            formatted_address = formatted_address.toString();
                        }

                        if (lat && lng) {
                            $scope.requestUberMain.end_latitude = lat;
                            $scope.requestUberMain.end_longitude = lng;
                            $scope.requestUberMain.end_formatted_address = formatted_address;

                            $rootScope.map._addMarker(lat, lng, formatted_address);
                            $scope.drawRoute();

                            /*
                             * update the prices
                             * */
                            $scope.requestUberMain.getPriceEstimates();
                        }
                    };

                    $scope.drawRoute = function () {
                        if ($scope.requestUberMain.start_latitude && $scope.requestUberMain.end_latitude) {
                            $rootScope.map._setCenter($scope.requestUberMain.start_latitude, $scope.requestUberMain.start_longitude);
                            $rootScope.map._drawRoute([$scope.requestUberMain.start_latitude, $scope.requestUberMain.start_longitude], [$scope.requestUberMain.end_latitude, $scope.requestUberMain.end_longitude])
                        }
                    };

                    $scope.startAtMyLocation = function () {
                        return Promise.resolve()
                            .then(function () {
                                if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                    return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                                } else {
                                    return $rootScope.map._getMyPosition($rootScope.map)
                                        .then(function () {
                                            if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                                return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                                            } else {
                                                $rootScope.main.showToast('warning', 'Could not find your position');
                                                return null;
                                            }
                                        })
                                }
                            })
                            .then(function (array) {
                                if (array) {
                                    $scope.requestUberMain.start_latitude = array[0];
                                    $scope.requestUberMain.start_longitude = array[1]
                                } else {
                                    //do nothing
                                }
                                return true;
                            })
                            .catch(function (e) {
                                console.log(e);
                                $rootScope.main.showToast('warning', 'An error occurred while trying to pin point your location');
                            });
                    };

                    $scope.endAtMyLocation = function () {
                        return Promise.resolve()
                            .then(function () {
                                if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                    return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                                } else {
                                    return $rootScope.map._getMyPosition($rootScope.map)
                                        .then(function () {
                                            if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                                return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                                            } else {
                                                $rootScope.main.showToast('warning', 'Could not find your position');
                                                return null;
                                            }
                                        })
                                }
                            })
                            .then(function (array) {
                                if (array) {
                                    $scope.requestUberMain.end_latitude = array[0];
                                    $scope.requestUberMain.end_longitude = array[1]
                                } else {
                                    //do nothing
                                }
                            })
                            .catch(function (e) {
                                console.log(e);
                                $rootScope.main.showToast('warning', 'An error occurred while trying to pin point your location');
                            });
                    };
                }
            };
        }]);
angular.module('app')
    .controller('uberRideStatusController', ['$rootScope', '$scope', '$http', '$ionicSlideBoxDelegate', function ($rootScope, $scope, $http, $ionicSlideBoxDelegate) {

        $rootScope.main.classes.body = 'rideStatus';

        $scope.uberRideStatusControllerMain = {

            /*
             * show status by default
             * */
            showStatus: true
        };

        /*
         * managing the slides
         * */

        $scope.goToSlide = function (index) {
            $ionicSlideBoxDelegate.slide(parseInt(index));
        };
        $scope.nextSlide = function (index) {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previousSlide = function (index) {
            $ionicSlideBoxDelegate.previous();
        };

    }])
    .directive('uberRideStatusDirective', ['$rootScope', '$http', 'service_rideStatus', '$interval', '$timeout', 'GLOBAL',
        function ($rootScope, $http, service_rideStatus, $interval, $timeout, GLOBAL) {
            return {
                restrict: 'AE',
                link: function ($scope, $element, $attr) {

                    /*
                     * clear all markers, then start updating map with new info
                     * */
                    $rootScope.map._removeAllPresentMarkers();

                    /*
                     * check the uberStatus and keep updating the map with the driver position
                     * */
                    $scope.uberRideStatusMain = {
                        rideStatus: null,
                        driver_latitude: null,
                        driver_longitude: null,
                        driver_info_window_marker: null,
                        start_lat: null,
                        start_lng: null,
                        end_lat: null,
                        end_lng: null,

                        updateUberRequestSandbox: function () {
                            Promise.resolve()
                                .then(function () {
                                    return Promise.delay(15000);
                                })
                                .then(function () {
                                    return $http.post(GLOBAL.baseUrl + '/updateUberRequestSandbox', {
                                        status: 'accepted'
                                    })
                                        .then(function (resp) {
                                            resp = resp.data;
                                            $rootScope.main.responseStatusHandler(resp);
                                            return true;
                                        })
                                        .catch(function (err) {
                                            err = err.data;
                                            $rootScope.main.responseStatusHandler(err);
                                            return true;
                                        })
                                })
                                .then(function () {
                                    return Promise.delay(30000);
                                })
                                .then(function () {
                                    return $http.post(GLOBAL.baseUrl + '/updateUberRequestSandbox', {
                                        status: 'arriving'
                                    })
                                        .then(function (resp) {
                                            resp = resp.data;
                                            $rootScope.main.responseStatusHandler(resp);
                                            return true;
                                        })
                                        .catch(function (err) {
                                            err = err.data;
                                            $rootScope.main.responseStatusHandler(err);
                                            return true;
                                        })
                                })
                                .then(function () {
                                    return Promise.delay(15000);
                                })
                                .then(function () {
                                    return $http.post(GLOBAL.baseUrl + '/updateUberRequestSandbox', {
                                        status: 'in_progress'
                                    })
                                        .then(function (resp) {
                                            resp = resp.data;
                                            $rootScope.main.responseStatusHandler(resp);
                                            return true;
                                        })
                                        .catch(function (err) {
                                            err = err.data;
                                            $rootScope.main.responseStatusHandler(err);
                                            return true;
                                        })
                                })
                                .then(function () {
                                    return Promise.delay(45000);
                                })
                                .then(function () {
                                    return $http.post(GLOBAL.baseUrl + '/updateUberRequestSandbox', {
                                        status: 'completed'
                                    })
                                        .then(function (resp) {
                                            resp = resp.data;
                                            $rootScope.main.responseStatusHandler(resp);
                                            return true;
                                        })
                                        .catch(function (err) {
                                            err = err.data;
                                            $rootScope.main.responseStatusHandler(err);
                                            return true;
                                        })
                                })
                                .catch(function (e) {
                                    console.log(e);
                                    return true;
                                })
                        }
                    };

                    $scope.uberRideStatusMain.updateUberRequestSandbox();

                    /*
                     * watch for the start and end, update on map
                     * */
                    $timeout(function () {
                        $scope.$watch(function () {
                            return $scope.uberRideStatusMain.start_lat;
                        }, function (val) {
                            if (val) {
                                $rootScope.map._addMarker(parseFloat($scope.uberRideStatusMain.start_lat).toFixed(10), parseFloat($scope.uberRideStatusMain.start_lng).toFixed(10));
                                $rootScope.map._addMarker(parseFloat($scope.uberRideStatusMain.end_lat).toFixed(10), parseFloat($scope.uberRideStatusMain.end_lng).toFixed(10));
                                /*
                                 * set center to me
                                 * */
                                $rootScope.map._setCenterToMe();
                            }
                        });
                    }, 3000);

                    function checkStatus() {
                        /*
                         * poll from service
                         * */
                        var val = service_rideStatus.rideStatus();

                        if (val) {

                            $scope.uberRideStatusMain.rideStatus = val;
                            $scope.uberRideStatusMain.start_lat = val.lastRide.startLatitude;
                            $scope.uberRideStatusMain.start_lng = val.lastRide.startLongitude;
                            $scope.uberRideStatusMain.end_lat = val.lastRide.endLatitude;
                            $scope.uberRideStatusMain.end_lng = val.lastRide.endLongitude;

                            /*
                             * put user's position on map
                             * */
                            $rootScope.map._updateUserInfoWindowMarker($rootScope.main.userData.firstName);

                            /*
                             * set center to driver
                             * */
                            if (val.status == 'in_progress') {
                                $rootScope.map._setCenter($scope.uberRideStatusMain.driver_latitude, $scope.uberRideStatusMain.driver_longitude);
                            } else {
                                $rootScope.map._setCenterToMe();
                            }


                            /*
                             * start updating the ride status
                             * */

                            if (val.location) {
                                $scope.uberRideStatusMain.driver_latitude = parseFloat(val.location.latitude).toFixed(10);
                                $scope.uberRideStatusMain.driver_longitude = parseFloat(val.location.longitude).toFixed(10);


                                /*
                                 * update the cars location
                                 * */
                                if (!$scope.uberRideStatusMain.driver_info_window_marker) {
                                    $scope.uberRideStatusMain.driver_info_window_marker = $rootScope.map._addInfoWindowMarker($scope.uberRideStatusMain.driver_latitude, $scope.uberRideStatusMain.driver_longitude, 'Driver');
                                } else {
                                    $rootScope.map._removeMarker($scope.uberRideStatusMain.driver_info_window_marker);
                                    $scope.uberRideStatusMain.driver_info_window_marker = $rootScope.map._addInfoWindowMarker($scope.uberRideStatusMain.driver_latitude, $scope.uberRideStatusMain.driver_longitude, 'Driver');
                                }
                            }
                        } else {
                            /*
                             * if there is nothing after, then trip is finished
                             * */
                            $scope.uberRideStatusMain.rideStatus = null;
                            if ($rootScope.main && $rootScope.main.userData) {
                                $rootScope.map._updateUserInfoWindowMarker($rootScope.main.userData.firstName);
                            }
                            $rootScope.map._setCenterToMe();
                        }
                    }

                    $timeout(function () {
                        $interval(function () {
                            checkStatus();
                        }, 5000); //update every 5 secs
                        checkStatus();
                    }, 3000);

                }
            };
        }]);
angular.module('app')
    .filter("responseFilter", ['$q', '$log', '$window', '$rootScope', function ($q, $log, $window, $rootScope) {
        return function (resp) {

            if (resp !== null && typeof resp === 'object') {
                if (resp.redirect) {
                    if (resp.redirectPage) {
                        $window.location.href = resp.redirectPage;
                    }

                    if (resp.redirectState) {
                        $rootScope.main.changeState(resp.redirectState)
                    }

                    return;
                }
                if (resp.reload) {
                    $rootScope.main.reloadPage();
                    return;
                }
                if (resp.notify) {
                    if (resp.type && resp.msg) {
                        $rootScope.main.showIonicAlert('Info', resp.msg);
                        return;
                    }
                }
                if (resp.dialog) {
                    if (resp.id) {
                        switch (resp.id) {
                            case "not-authorized":
                                $rootScope.main.showIonicAlert('Info', 'You are not authorized to be/access this page or resource.');
                                break;
                            case "sign-in":
                                $rootScope.main.showIonicAlert('Info', 'Please sign in to continue.')
                                    .then(function () {
                                        $rootScope.main.changeState('login')
                                    });
                                break;
                            default:
                            //do nothing
                        }
                        return;
                    }
                }
                if (resp.banner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.main.showIonicAlert('Info', resp.msg);
                        return;
                    }
                }
                if (resp.signInBanner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.main.showIonicAlert('Info', resp.msg);
                        return;
                    }
                }
                if (resp.registrationBanner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.main.showIonicAlert('Info', resp.msg);
                        return;
                    }
                }
                if (resp.reason) {
                    $log.warn(resp.reason);
                }
            } else {
                //do nothing
            }
        };
    }]);