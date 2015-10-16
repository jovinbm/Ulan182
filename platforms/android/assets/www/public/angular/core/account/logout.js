angular.module('app')
    .directive('logoutScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.logout = function () {
                    return Promise.resolve()
                        .then(function () {
                            return $http.post('http://www.pluschat.net/api/logoutClient', {}).then(function (resp) {
                                console.log(resp);
                                resp = resp.data;
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