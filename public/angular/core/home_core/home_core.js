angular.module('app')
    .controller('homeCoreController', ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {
        $rootScope.main.classes.body = 'homepage';

        /*
         * match the colum heights
         * */

        $("body .leftCol").matchHeight({
            byRow: true,
            property: 'height',
            target: $("body .mapCol")
        });

        $scope.$watch(function () {
            return $rootScope.main.userData
        }, function (userData, oldVal) {
            if (userData) {
                if (userData.uber.access_token == '') {
                    $rootScope.main.changeState('home.connectToUber');
                }
            }
        });

    }])
    .directive('homeCoreScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {
            }
        };
    }])
    .directive('uberConnect', ['$rootScope', '$http', function ($rootScope, $http) {
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
                                return $http.post('/api/getUberAuthorizationUrl', {})
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
                                $scope.uberConnect.isBusy = false;
                                $rootScope.main.redirectToPage(resp.url);
                                return true;
                            })
                            .catch(function (err) {
                                $scope.uberConnect.isBusy = false;
                                console.log(err);
                                return true;
                            })
                    }
                }
            }
        };
    }])
    .controller('requestUberController', ['$rootScope', '$scope', '$http', function ($rootScope, $scope, $http) {

        $scope.requestUberControllerMain = {

            /*
             * uberRideStatus will carry the request status of uber after the user
             * requests an uber
             * */
            uberRideStatus: false,

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

            products: [],

            getProducts: function () {

                var latitude;
                var longitude;

                return Promise.resolve()
                    .then(function () {
                        return $rootScope.map.getMyPosition();
                    })
                    .then(function () {
                        latitude = $rootScope.main.userLocation.latitude;
                        longitude = $rootScope.main.userLocation.longitude;

                        if (latitude || longitude) {
                            return true;
                        } else {
                            throw {
                                code: 600
                            };
                        }
                    })
                    .then(function () {
                        return $http.post('/api/getProducts', {
                            latitude: latitude,
                            longitude: longitude
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
                        $scope.requestUberControllerMain.products = resp.obj.products;
                        return true;
                    })
                    .catch(function (e) {
                        if (e.code === 600) {
                            $rootScope.main.showToast('warning', 'We could not determine your precise location to list the available products in your area');
                        } else {
                            throw e
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                        return true;
                    })
            }
        };

        $scope.requestUberControllerMain.getProducts();

    }])
    .directive('requestUberDirective', ['$rootScope', '$http', function ($rootScope, $http) {
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
                                $scope.requestUberControllerMain.uberRideStatus = resp.obj;
                                console.log(JSON.stringify($scope.requestUberControllerMain.uberRideStatus));
                                /*
                                 * start getting the ride statuses
                                 * */
                                $scope.requestUberMain.getRideStatus();
                                return true;
                            })
                            .catch(function (e) {
                                if (e.code === 600) {
                                    $rootScope.main.showToast('warning', 'Some fields are missing');
                                } else {
                                    throw e
                                }
                                $scope.requestUberMain.isBusy = false;
                            })
                            .catch(function (err) {
                                $scope.requestUberMain.isBusy = false;
                                console.log(err);
                                return true;
                            })
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
                                $scope.requestUberMain.isBusy = false;
                                $scope.requestUberControllerMain.uberRideStatus = resp.obj;
                                console.log(JSON.stringify($scope.requestUberControllerMain.uberRideStatus));
                                return true;
                            })
                            .catch(function (err) {
                                $scope.requestUberMain.isBusy = false;
                                console.log(err);
                                return true;
                            })
                            .then(function () {
                                return Promise.delay(10000) //delay 10 seconds
                                    .then(function () {
                                        return $scope.requestUberMain.getRideStatus();
                                    });

                            })
                    },

                    getPriceEstimate: function () {

                        if ($scope.requestUberMain.start_latitude && $scope.requestUberMain.start_longitude && $scope.requestUberMain.end_latitude && $scope.requestUberMain.end_longitude) {

                            $scope.requestUberMain.isBusy = true;
                            $scope.requestUberMain.status = 'Getting cost estimates...';

                            return Promise.resolve()
                                .then(function () {
                                    return $http.post('/api/getPriceEstimate', {
                                        start_latitude: $scope.requestUberMain.start_latitude,
                                        start_longitude: $scope.requestUberMain.start_longitude,
                                        end_latitude: $scope.requestUberMain.end_latitude,
                                        end_longitude: $scope.requestUberMain.end_longitude
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
                                    $scope.requestUberControllerMain.priceEstimateArray = resp.obj.prices;
                                    return true;
                                })
                                .catch(function (err) {
                                    $scope.uberConnect.isBusy = false;
                                    console.log(err);
                                    return true;
                                })
                        }
                    },

                    getTimeEstimate: function () {

                        if ($scope.requestUberMain.start_latitude && $scope.requestUberMain.start_longitude) {

                            $scope.requestUberMain.isBusy = true;
                            $scope.requestUberMain.status = 'Getting time estimates...';

                            return Promise.resolve()
                                .then(function () {
                                    return $http.post('/api/getTimeEstimate', {
                                        start_latitude: $scope.requestUberMain.start_latitude,
                                        start_longitude: $scope.requestUberMain.start_longitude
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
                                    $scope.requestUberControllerMain.timeEstimateArray = resp.obj.times;
                                    return true;
                                })
                                .catch(function (err) {
                                    $scope.uberConnect.isBusy = false;
                                    console.log(err);
                                    return true;
                                })
                        }
                    }
                };

                /*
                 * autocomplete for the input.geoFields
                 * */
                angular.element('.start input.geoField').geocomplete({
                    details: ".start .details",
                    detailsAttribute: "data-geo"
                })
                    .bind("geocode:result", function (event, result) {
                        var lat = result.geometry.location.J;
                        var lng = result.geometry.location.M;
                        var formatted_address = result.formatted_address;

                        if (lat && lng) {
                            $scope.updateStartLocation(lat, lng, formatted_address);
                            //update the map and price estimate to current route
                            $scope.drawRoute();
                            $scope.requestUberMain.getPriceEstimate();
                            $scope.requestUberMain.getTimeEstimate();
                        }
                    });
                angular.element('.end input.geoField').geocomplete({
                    details: ".end .details",
                    detailsAttribute: "data-geo"
                })
                    .bind("geocode:result", function (event, result) {
                        var lat = result.geometry.location.J;
                        var lng = result.geometry.location.M;
                        var formatted_address = result.formatted_address;

                        if (lat && lng) {
                            $scope.updateEndLocation(lat, lng, formatted_address);
                            //update the map and price estimate to current route
                            $scope.drawRoute();
                            $scope.requestUberMain.getPriceEstimate();
                            $scope.requestUberMain.getTimeEstimate();
                        }
                    });

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

                        $rootScope.map.addMarker(lat, lng, formatted_address);
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

                        $rootScope.map.addMarker(lat, lng, formatted_address);
                    }
                };

                $scope.drawRoute = function () {
                    if ($scope.requestUberMain.start_latitude && $scope.requestUberMain.end_latitude) {
                        $rootScope.map.drawRoute([$scope.requestUberMain.start_latitude, $scope.requestUberMain.start_longitude], [$scope.requestUberMain.end_latitude, $scope.requestUberMain.end_longitude])
                    }
                };

                $scope.startAtMyLocation = function () {
                    return Promise.resolve()
                        .then(function () {
                            if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                            } else {
                                return $rootScope.map.getMyPosition()
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
                                return $rootScope.map.getMyPosition()
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
    }])
    .controller('priceEstimatorController', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                /*
                 * priceEstimateArray contains the data obtained from price estimates
                 * including the types of cars available
                 * distance etc
                 * */
                $scope.priceEstimateArray = [];
            }
        };
    }])
    .directive('priceEstimatorResults', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {
                /*
                 * directive holds the logic for displaying the logic behind the price estimates
                 * */
            }
        };
    }])
    .directive('priceEstimator', ['$rootScope', '$http', function ($rootScope, $http) {
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

                    getPriceEstimate: function () {

                        $scope.priceEstimator.isBusy = true;
                        $scope.priceEstimator.status = 'Calculating...';

                        return Promise.resolve()
                            .then(function () {
                                if ($scope.priceEstimator.start_latitude && $scope.priceEstimator.start_longitude && $scope.priceEstimator.end_latitude && $scope.priceEstimator.end_longitude) {
                                    return true;
                                } else {
                                    throw {
                                        code: 600
                                    };
                                }
                            })
                            .then(function () {
                                return $http.post('/api/getPriceEstimate', {
                                    start_latitude: $scope.priceEstimator.start_latitude,
                                    start_longitude: $scope.priceEstimator.start_longitude,
                                    end_latitude: $scope.priceEstimator.end_latitude,
                                    end_longitude: $scope.priceEstimator.end_longitude
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
                                $scope.priceEstimator.isBusy = false;
                                $scope.priceEstimateArray = resp.obj.prices;
                                return true;
                            })
                            .catch(function (e) {
                                if (e.code === 600) {
                                    $rootScope.main.showToast('warning', 'Some fields are missing');
                                } else {
                                    throw e
                                }
                                $scope.priceEstimator.isBusy = false;
                            })
                            .catch(function (err) {
                                $scope.uberConnect.isBusy = false;
                                console.log(err);
                                return true;
                            })
                    }
                };

                /*
                 * autocomplete for the input.geoFields
                 * */
                angular.element('.start input.geoField').geocomplete({
                    details: ".start .details",
                    detailsAttribute: "data-geo"
                })
                    .bind("geocode:result", function (event, result) {
                        var lat = result.geometry.location.J;
                        var lng = result.geometry.location.M;
                        var formatted_address = result.formatted_address;

                        console.log(result.geometry.location);

                        if (lat && lng) {
                            $scope.updateStartLocation(lat, lng, formatted_address);
                            $scope.drawRoute();
                        }
                    });
                angular.element('.end input.geoField').geocomplete({
                    details: ".end .details",
                    detailsAttribute: "data-geo"
                })
                    .bind("geocode:result", function (event, result) {
                        var lat = result.geometry.location.J;
                        var lng = result.geometry.location.M;
                        var formatted_address = result.formatted_address;

                        if (lat && lng) {
                            $scope.updateEndLocation(lat, lng, formatted_address);
                            $scope.drawRoute();
                        }
                    });

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

                        $rootScope.map.addMarker(lat, lng, formatted_address);
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

                        $rootScope.map.addMarker(lat, lng, formatted_address);
                    }
                };

                $scope.drawRoute = function () {
                    if ($scope.priceEstimator.start_latitude && $scope.priceEstimator.end_latitude) {
                        $rootScope.map.drawRoute([$scope.priceEstimator.start_latitude, $scope.priceEstimator.start_longitude], [$scope.priceEstimator.end_latitude, $scope.priceEstimator.end_longitude])
                    }
                };

                $scope.startAtMyLocation = function () {
                    return Promise.resolve()
                        .then(function () {
                            if ($rootScope.main.userLocation.latitude && $rootScope.main.userLocation.longitude) {
                                return [$rootScope.main.userLocation.latitude, $rootScope.main.userLocation.longitude]
                            } else {
                                return $rootScope.map.getMyPosition()
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
                                return $rootScope.map.getMyPosition()
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
    }])
    .directive('mainMapScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                /*
                 * marker counter to switch btn markers
                 * */
                var marker_counter = 0;

                function resizeMap() {
                    angular.element("body.homepage #map").css({
                        "height": angular.element(window).height() - angular.element("homepage main-navigation").height(),
                        "margin": 0,
                        "padding-left": 0
                    });
                }

                resizeMap();

                angular.element(window).resize(function () {
                    resizeMap();
                });

                var map = new GMaps({
                    div: '#map',
                    lat: -12.043333,
                    lng: -77.028333
                });

                $rootScope.map = {
                    getMyPosition: function () {
                        /*
                         * if userLocation is found, the universalController object is updated with the user location
                         * */
                        return new Promise(function (resolve, reject) {
                            GMaps.geolocate({
                                success: function (position) {
                                    $rootScope.main.updateUserLocation(position.coords.latitude, position.coords.longitude);
                                    map.setCenter(position.coords.latitude, position.coords.longitude);

                                    /*
                                     * set 2 default markers
                                     * */

                                    map.addMarker({
                                        lat: position.coords.latitude,
                                        lng: position.coords.longitude,
                                        title: ''
                                    });

                                    map.addMarker({
                                        lat: position.coords.latitude - 0.004,
                                        lng: position.coords.longitude + 0.004,
                                        title: ''
                                    });
                                },
                                error: function (error) {
                                    alert('Geolocation failed: ' + error.message);
                                },
                                not_supported: function () {
                                    alert("Your browser does not support geolocation");
                                },
                                always: function () {
                                    resolve(true);
                                }
                            });
                        })
                    },

                    addMarker: function (lat, lng, title) {
                        map.addMarker({
                            lat: lat,
                            lng: lng,
                            title: title || ''
                        });
                    },

                    drawRoute: function (originArr, destArray) {
                        if (!originArr || !destArray) return;
                        if (originArr.length < 2 || destArray.length < 2) return;
                        map.cleanRoute();
                        map.removeMarkers();

                        $rootScope.map.addMarker(originArr[0], originArr[1]);
                        $rootScope.map.addMarker(destArray[0], destArray[1]);

                        map.drawRoute({
                            origin: originArr,
                            destination: destArray,
                            travelMode: 'driving',
                            strokeColor: '#09091A',
                            strokeOpacity: 0.6,
                            strokeWeight: 6
                        });
                    }
                };

                $rootScope.map.getMyPosition();
            }
        };
    }]);