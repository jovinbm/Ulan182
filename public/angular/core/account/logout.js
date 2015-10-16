angular.module('app')
    .directive('logoutScope', ['$rootScope', '$http', '$localstorage', function ($rootScope, $http, $localstorage) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.logout = function () {
                    return Promise.resolve()
                        .then(function () {
                            return $http.post('http://www.pluschat.net/api/logoutClient', {}).then(function (resp) {
                                console.log(resp);
                                resp = resp.data;
                                /*
                                 * delete token
                                 * */
                                $localstorage.set('token', '');
                                $rootScope.main.responseStatusHandler(resp);
                                $rootScope.main.userData = null;
                                return true;
                            })
                                .catch(function (err) {
                                    err = err.data;
                                    $rootScope.main.responseStatusHandler(err);
                                    return true;
                                })
                        })
                        .catch(function (err) {
                            console.log(err);
                            return true;
                        })
                }
            }
        };
    }]);