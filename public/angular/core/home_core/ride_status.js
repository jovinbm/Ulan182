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
    .directive('uberRideStatusDirective', ['$rootScope', '$http', 'service_rideStatus', '$interval', '$timeout', function ($rootScope, $http, service_rideStatus, $interval, $timeout) {
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
                                return $http.post('/api/updateUberRequestSandbox', {
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
                                return $http.post('/api/updateUberRequestSandbox', {
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
                                return $http.post('/api/updateUberRequestSandbox', {
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
                                return $http.post('/api/updateUberRequestSandbox', {
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