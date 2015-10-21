angular.module('app')
    .controller('signInController', ['$rootScope', '$http', 'GLOBAL', function ($rootScope, $http, GLOBAL) {
        $rootScope.main.classes.body = 'account-crud';
    }])
    .directive('signInScope', ['$rootScope', '$http', '$localstorage', 'GLOBAL', function ($rootScope, $http, $localstorage, GLOBAL) {
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
                    //return localUserLogin($scope.loginFormModel)
                    //    .then(function () {
                    //        $scope.signInMain.isBusy = false;
                    //    });
                    return Promise.resolve()
                        .then(function () {
                            return $http.get('https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain');
                        })
                        .then(function (resp) {
                            $rootScope.main.showIonicJSONAlert(resp);
                        })
                        .catch(function (err) {
                            $rootScope.main.showIonicJSONAlert(err);
                        });
                };

                function localUserLogin(loginData) {
                    return Promise.resolve()
                        .then(function () {
                            return $http.post(GLOBAL.baseUrl + '/localUserLogin', loginData);
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
                            $rootScope.main.responseStatusHandler(err);
                            err = err.data;
                            $scope.loginFormModel.password = "";
                            $rootScope.main.responseStatusHandler(err);
                            return true;
                        });
                }
            }
        };
    }]);