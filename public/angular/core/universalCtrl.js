angular.module('app')
    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('app')
            .setStorageCookieDomain(document.location.hostname.search("uber") !== -1 ? 'uber.org' : '')
            .setStorageType('localStorage');
    });

angular.module('app')
    .controller('UniversalController', ['$filter', '$window', '$location', '$scope', '$rootScope', 'ngDialog', '$anchorScroll', 'localStorageService', '$http', '$state', 'toastr', '$interval',
        function ($filter, $window, $location, $scope, $rootScope, ngDialog, $anchorScroll, localStorageService, $http, $state, toastr, $interval) {

            $rootScope.main = {

                /*
                 * uberRideStatus will carry the request status of uber after the user
                 * requests an uber
                 * */
                uberRideStatus: null,

                uberRideRequestStatuses: {
                    processing: "Processing",
                    no_drivers_available: 'No drivers available',
                    accepted: 'Accepted',
                    arriving: 'Arriving',
                    in_progress: 'In progress',
                    driver_canceled: 'Driver canceled',
                    rider_canceled: 'Rider canceled',
                    completed: 'Completed'
                },

                getRideStatus: function () {

                    return Promise.resolve()
                        .then(function () {
                            console.log('checking ride status');
                            return $http.post('/api/getRideStatus', {})
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
                            $rootScope.main.uberRideStatus = resp.obj;
                            /*
                             * put a rating array for the ng-repeat stars
                             * */
                            if (!$rootScope.main.uberRideStatus) return true;

                            if ($rootScope.main.uberRideStatus.driver) {
                                $rootScope.main.uberRideStatus.driver.ratingArray = new Array(Math.ceil($rootScope.main.uberRideStatus.driver.rating));
                            }
                            console.log(JSON.stringify($rootScope.main.uberRideStatus));
                            return true;
                        })
                        .catch(function (err) {
                            console.log(err);
                            return true;
                        })
                        .then(function () {
                            return Promise.delay(10000) //delay 10 seconds
                                .then(function () {
                                    return $rootScope.main.getRideStatus();
                                });

                        })
                },

                classes: {
                    body: 'index'
                },

                userData: null,

                userLocation: {
                    latitude: '',
                    longitude: ''
                },

                updateUserLocation: function (latitude, longitude) {
                    $rootScope.main.userLocation.latitude = parseFloat(latitude).toFixed(10);
                    $rootScope.main.userLocation.longitude = parseFloat(longitude).toFixed(10);
                },

                getUserData: function () {
                    return Promise.resolve()
                        .then(function () {
                            return $http.post("/api/getUserData", {})
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

                startIntervalTimer: function (intervalInMilliseconds, fn) {
                    return $interval(function () {
                        if ($scope.blood_1 > 0 && $scope.blood_2 > 0) {
                            $scope.blood_1 = $scope.blood_1 - 3;
                            $scope.blood_2 = $scope.blood_2 - 4;
                        } else {
                            $scope.stopFight();
                        }
                    }, 100);
                },

                checkLocalStorageSupport: function () {
                    if (localStorageService.isSupported) {
                        return true;
                    } else {
                        return false;
                    }
                },

                checkCookieIsEnabled: function () {
                    if (localStorageService.cookie.isSupported) {
                        return true;
                    } else {
                        return false;
                    }
                },

                saveToLocalStorage: function (key, val) {
                    var object = {
                        value: val,
                        timestamp: new Date().getTime()
                    };
                    return localStorageService.set(key, object); //returns a boolean
                },

                getFromLocalStorage: function (key, maxAgeSeconds) {
                    if (!maxAgeSeconds) {
                        maxAgeSeconds = 86400; //default to one day
                    }
                    if ($rootScope.main.checkIfExistsOnLocalStorage(key)) {
                        var object = localStorageService.get(key);
                        var dateString = object.timestamp;
                        var now = new Date().getTime().toString();
                        if (now - dateString > (maxAgeSeconds * 1000)) {
                            $rootScope.main.removeFromLocalStorage([key]); //remove expired item from local storage
                            return false;
                        } else {
                            return object.value;
                        }
                    } else {
                        return false;
                    }
                },

                saveKeyToCookie: function (key, val, maxAgeInDays) {
                    if (!maxAgeInDays) {
                        maxAgeInDays = 2; //defaults to 2 day(s)
                    }
                    var object = {
                        value: val,
                        timestamp: new Date().getTime()
                    };
                    object = JSON.stringify(object);
                    return localStorageService.cookie.set(key, object, maxAgeInDays); //returns a boolean
                },

                getKeyFromCookie: function (key, maxAgeSeconds) {
                    if (!maxAgeSeconds) {
                        maxAgeSeconds = 86400; //default to one day
                    }
                    var object = localStorageService.cookie.get(key);
                    if (object) {
                        var dateString = object.timestamp;
                        var now = new Date().getTime().toString();
                        if ((now - dateString) > (maxAgeSeconds * 1000)) {
                            $rootScope.main.removeKeyFromCookie(key); //remove expired item from local storage
                            return false;
                        } else {
                            return object.value;
                        }
                    } else {
                        return false;
                    }
                },

                checkIfExistsOnLocalStorage: function (key) {
                    var keys = localStorageService.keys();
                    var len = keys.length;
                    var exists = false;
                    for (var i = 0; i < len; i++) {
                        if (keys[i] == key) {
                            exists = true;
                            break;
                        }
                    }
                    return exists;
                },

                removeFromLocalStorage: function (keyArray, all) {  //if all is true, it clears all keys
                    if (all) {
                        return localStorageService.clearAll();
                    } else {
                        keyArray.forEach(function (key) {
                            localStorageService.remove(key);
                        });
                    }

                    return true;
                },

                removeKeyFromCookie: function (key) {  //if all is true, it clears all keys
                    return localStorageService.cookie.remove(key);
                },

                goToTop: function () {
                    $location.hash('navigation');
                    $anchorScroll();
                },

                back: function () {
                    $rootScope.back();
                },

                responseStatusHandler: function (resp) {
                    $filter('responseFilter')(resp);
                },

                showToast: function (toastType, text) {
                    switch (toastType) {
                        case "success":
                            toastr.clear();
                            toastr.success(text);
                            break;
                        case "warning":
                            toastr.clear();
                            toastr.warning(text, 'Warning', {
                                closeButton: true,
                                tapToDismiss: true
                            });
                            break;
                        case "error":
                            toastr.clear();
                            toastr.error(text, 'Error', {
                                closeButton: true,
                                tapToDismiss: true,
                                timeOut: false
                            });
                            break;
                        default:
                            //clears current list of toasts
                            toastr.clear();
                    }
                },

                clearToasts: function () {
                    toastr.clear();
                },

                redirectToIndex: function () {
                    $window.location.href = '/index.app';
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

                redirectToPage: function (pathWithFirstSlash) {
                    $window.location.href = pathWithFirstSlash;
                },

                redirectToPreviousPage: function () {
                    window.location.href = document.referrer;
                },

                showExecuting: function (message) {
                    var msg;
                    if (!message || typeof message !== 'string' || message.length === 0) {
                        msg = 'Performing action...';
                    } else {
                        msg = message + '...';
                    }

                    return ngDialog.open({
                        data: {
                            message: msg
                        },
                        templateUrl: '_executing_dialog',
                        className: 'ngdialog-theme-default',
                        overlay: true,
                        showClose: false,
                        closeByEscape: false,
                        closeByDocument: false,
                        cache: true,
                        trapFocus: false,
                        preserveFocus: true
                    });
                }

            };

            /*
             * function checks if the user has requested an uber, if so, it forces the user to remain in the requestUber state
             * */
            $scope.checkUberRide = function () {
                if ($rootScope.main.uberRideStatus) {
                    $rootScope.main.changeState('home.rideStatus', null, ['home.rideStatus']);
                }
            };

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.main.getUserData();
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $scope.checkUberRide();
            });


            $scope.$watch(function () {
                return $rootScope.main.uberRideStatus
            }, function () {
                $scope.checkUberRide();
            });

            /*
             * begin polling ride statuses
             * */
            $rootScope.main.getRideStatus();


        }
    ]);