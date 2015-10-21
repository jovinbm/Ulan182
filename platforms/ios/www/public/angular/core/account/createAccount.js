angular.module('app')
    .controller('createAccountController', ['$rootScope', '$http', function ($rootScope, $http) {
        $rootScope.main.classes.body = 'account-crud';
    }])
    .directive('createAccountScope', ['$rootScope', '$http', '$localstorage', 'GLOBAL', function ($rootScope, $http, $localstorage, GLOBAL) {
        return {
            restrict: 'AE',
            link: function ($scope) {
                $scope.createMain = {
                    isBusy: false
                };

                $scope.registrationDetails = {
                    email: "",
                    firstName: "",
                    lastName: "",
                    username: "",
                    password1: "",
                    password2: ""
                };

                $scope.createAccount = function () {
                    $scope.createMain.isBusy = true;
                    return createAccount($scope.registrationDetails)
                        .then(function () {
                            $scope.createMain.isBusy = false;
                        });
                };

                function createAccount(details) {
                    return $http.post(GLOBAL.baseUrl + '/createAccount', details)
                        .then(function (resp) {
                            resp = resp.data;
                            /*
                             * save the users token
                             * */
                            $localstorage.set('token', resp.token);
                            $rootScope.main.responseStatusHandler(resp);
                            return true;
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            $scope.registrationDetails.password1 = "";
                            $scope.registrationDetails.password2 = "";
                            return true;
                        });
                }
            }
        };
    }]);