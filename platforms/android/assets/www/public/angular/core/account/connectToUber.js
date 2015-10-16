angular.module('app')
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
                                return $http.post('http://www.pluschat.net/api/getUberAuthorizationUrl', {})
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