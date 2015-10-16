angular.module('app')
    .controller('signInController', ['$rootScope', '$http', function ($rootScope, $http) {
        $rootScope.main.classes.body = 'account-crud';
    }])
    .directive('signInScope', ['$rootScope', '$http', '$localstorage', function ($rootScope, $http, $localstorage) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.signInMain = {
                    isBusy: false
                };

                $scope.loginFormModel = {
                    username: "",
                    password: ""
                };

                $scope.submitLocalLoginForm = function () {
                    $scope.signInMain.isBusy = true;
                    return localUserLogin($scope.loginFormModel)
                        .then(function () {
                            $scope.signInMain.isBusy = false;
                        });
                };

                function localUserLogin(loginData) {
                    return Promise.resolve()
                        .then(function () {
                            return $http.post('http://www.pluschat.net/api/localUserLogin', loginData);
                        })
                        .then(function (resp) {
                            resp = resp.data;
                            /*
                             * save the users token before redirecting
                             * */
                            $localstorage.set('token', resp.token);
                            $rootScope.main.responseStatusHandler(resp);
                            return true;
                        })
                        .catch(function (err) {
                            err = err.data;
                            $scope.loginFormModel.password = "";
                            $rootScope.main.responseStatusHandler(err);
                            return true;
                        });
                }
            }
        };
    }]);