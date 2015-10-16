angular.module('app')
    .controller('requestUberController', ['$rootScope', '$scope', '$http','$ionicSlideBoxDelegate', function ($rootScope, $scope, $http, $ionicSlideBoxDelegate) {

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
    ['$rootScope', '$http', '$interval', 'service_uberProducts', 'service_uberPrices', 'service_uberTimeEstimates', 'service_rideStatus',
        function ($rootScope, $http, $interval, service_uberProducts, service_uberPrices, service_uberTimeEstimates, service_rideStatus) {
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
                                    return $http.post('/api/requestUber', {
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