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