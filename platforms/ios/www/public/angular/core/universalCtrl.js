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