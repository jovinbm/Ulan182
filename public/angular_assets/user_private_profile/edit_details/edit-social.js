angular.module('app')
    .directive('socialDirective', ['$rootScope', 'globals', '$http', function ($rootScope, globals, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.social = {
                    showSpinner: false,
                    isBusy: function () {
                        this.showSpinner = true;
                        $scope.main.busy();
                    },
                    done: function () {
                        this.showSpinner = false;
                        $scope.main.done();
                    },

                    deleteConnectedService: function (serviceName) {

                        $scope.social.isBusy();

                        return Promise.resolve()
                            .then(function () {
                                if (!serviceName) {
                                    throw {
                                        code: 500,
                                        msg: 'serviceName = ' + serviceName
                                    };
                                } else {
                                    return true;
                                }
                            })
                            .then(function () {
                                return $http.post('/api/deleteConnectedService', {
                                    serviceName: serviceName
                                })
                                    .then(function (resp) {
                                        resp = resp.data;
                                        $rootScope.main.responseStatusHandler(resp);
                                        return resp.theUser;
                                    })
                                    .catch(function (err) {
                                        err = err.data;
                                        $rootScope.main.responseStatusHandler(err);
                                        throw err;
                                    })
                            })
                            .then(function (updatedUser) {
                                $scope.main.userData.social = updatedUser.social;
                                return true;
                            })
                            .then(function () {
                                if (serviceName === 'facebook') {
                                    return new Promise(function (resolve, reject) {
                                        FB.getLoginStatus(function (response) {
                                            if (response.status === 'connected') {
                                                FB.logout(function (response) {
                                                    resolve(true);
                                                });
                                            } else {
                                                resolve(true);
                                            }
                                        });
                                    })
                                } else {
                                    return true;
                                }
                            })
                            .catch(function (err) {
                                console.log(err);
                                return true;
                            })
                            .then(function () {
                                $scope.social.done();
                            })

                    }
                };

                var fbOptions = {
                    credentials: {},
                    profile: {}
                };

                $scope.connectToFacebook = function () {

                    $scope.social.isBusy();

                    return Promise.resolve()
                        .then(function () {
                            return new Promise(function (resolve, reject) {
                                FB.login(function (credentials) {
                                    resolve(credentials)
                                });
                            })
                        })
                        .then(function (credentials) {
                            if (credentials.status !== 'connected') {
                                throw {
                                    code: 401
                                };
                            } else {
                                fbOptions.credentials = credentials.authResponse;
                                //add the date
                                fbOptions.credentials.dateConnected = new Date().getTime();
                                return true;
                            }
                        })
                        .then(function () {
                            //check that the permissions to the public profile are granted
                            return new Promise(function (resolve, reject) {
                                FB.api('/me/permissions', function (response) {
                                    var permissionsArray = response.data;
                                    var public_profile = false;
                                    for (var i = 0; i < permissionsArray.length; i++) {
                                        if (permissionsArray[i].permission == "public_profile") {
                                            permissionsArray[i].status === 'granted' ? public_profile = true : public_profile = false;
                                            break;
                                        }
                                    }

                                    if (!public_profile) {
                                        reject({
                                            code: 401
                                        });
                                    } else {
                                        resolve(true);
                                    }
                                });
                            })
                        })
                        .then(function () {
                            return new Promise(function (resolve, reject) {
                                FB.api('/me', function (response) {
                                    resolve(response);
                                });
                            })
                        })
                        .then(function (profile) {
                            if (profile.id) { //check that we actually have the profile
                                fbOptions.profile = profile;
                                return true;
                            } else {
                                throw {
                                    msg: 'profile = ' + profile,
                                    code: 500
                                };
                            }
                        })
                        .then(function () {
                            return $http.post('/api/updateUserFacebook', fbOptions)
                                .then(function (resp) {
                                    resp = resp.data;
                                    $rootScope.main.responseStatusHandler(resp);
                                    return resp.theUser;
                                })
                                .catch(function (err) {
                                    err = err.data;
                                    $rootScope.main.responseStatusHandler(err);
                                    throw err;
                                })
                        })
                        .then(function (updatedUser) {
                            $scope.main.userData.social = updatedUser.social;
                            return true;
                        })
                        .catch(function (err) {
                            console.log(err);
                            return true;
                        })
                        .then(function () {
                            $scope.social.done();
                        })
                }
            }
        }
    }]);