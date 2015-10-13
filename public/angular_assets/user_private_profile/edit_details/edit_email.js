angular.module('app')
    .directive('emailDirective', ['$rootScope', 'globals', '$http', function ($rootScope, globals, $http) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editEmail = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.email = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelEmail = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.email = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.email = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);