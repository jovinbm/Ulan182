angular.module('app')
    .directive('signInScope', ['$rootScope', '$http', function ($rootScope, $http) {
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

                $scope.submitLocalLoginForm = function (redirect) {
                    $scope.signInMain.isBusy = true;
                    return localUserLogin($scope.loginFormModel, redirect)
                        .then(function () {
                            $scope.signInMain.isBusy = false;
                        });
                };

                function localUserLogin(loginData, redirect) {
                    return Promise.resolve()
                        .then(function () {
                            if (redirect) {
                                return $http.post('/localUserLogin?lastpage=' + document.referrer, loginData);
                            } else {
                                return $http.post('/localUserLogin', loginData);
                            }
                        })
                        .then(function (resp) {
                            resp = resp.data;
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