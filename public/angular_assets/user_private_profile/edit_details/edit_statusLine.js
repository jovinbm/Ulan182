angular.module('app')
    .directive('statusLineDirective', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editStatusLine = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.statusLine = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelStatusLine = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.statusLine = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.statusLine = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);