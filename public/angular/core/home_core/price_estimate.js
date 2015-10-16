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