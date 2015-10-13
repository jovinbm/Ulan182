angular.module('app')
    .directive('fullName', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editFullName = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.fullName = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelFullName = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.firstName = '';
                            $scope.main.lastName = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.fullName = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);