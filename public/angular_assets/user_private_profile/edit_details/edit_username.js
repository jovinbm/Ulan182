angular.module('app')
    .directive('usernameDirective', ['$rootScope', 'globals', '$http', function ($rootScope, globals, $http) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editUsername = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.username = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelUsername = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.username = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.username = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);