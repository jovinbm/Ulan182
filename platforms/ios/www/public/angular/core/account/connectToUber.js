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
                                    $cordovaOauth.uber('5ZCEhRHb7dPloybTSGa3mojIcRIMBXVg', ['request profile history'], {})
                                        .catch(function (e) {
                                            $rootScope.main.showToast('warning', 'Authorization not completed');
                                            throw e;
                                        })
                                        .then(function (result) {
                                            var authorizationCode = result.authorizationCode;
                                            if (authorizationCode) {
                                                return $http.get(GLOBAL.baseUrl + '/uberauth/callback?code=' + authorizationCode)
                                                    .catch(function (err) {
                                                        err = err.data;
                                                        $rootScope.main.responseStatusHandler(err);
                                                        throw err;
                                                    })
                                                    .then(function (resp) {
                                                        resp = resp.data;
                                                        $rootScope.main.responseStatusHandler(resp);
                                                        return resp;
                                                    })
                                            } else {
                                                throw {
                                                    err: new Error('No authorization code found'),
                                                    code: 500
                                                };
                                            }
                                        })
                                        .catch(function (e) {
                                            console.log(e);
                                            return true;
                                        })
                                        .then(function () {
                                            $scope.uberConnect.isBusy = false;
                                            $scope.uberConnect.status = '';
                                            return true;
                                        })
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