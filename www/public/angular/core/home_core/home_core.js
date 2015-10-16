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
    .factory("service_uberProducts", ['$interval', '$rootScope', '$http', '$timeout', function ($interval, $rootScope, $http, $timeout) {
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
                    return $http.post('/api/getProducts', {
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
    .factory("service_uberPrices", ['$interval', '$rootScope', '$http', function ($interval, $rootScope, $http) {
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
                    return $http.post('/api/getPriceEstimate', {
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
    .factory("service_uberTimeEstimates", ['$interval', '$rootScope', '$http', function ($interval, $rootScope, $http) {
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
                    return $http.post('/api/getTimeEstimate', {
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
    .factory("service_rideStatus", ['$interval', '$rootScope', '$http', function ($interval, $rootScope, $http) {
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