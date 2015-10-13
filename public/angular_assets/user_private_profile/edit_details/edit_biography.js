angular.module('app')
    .directive('biographyDirective', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editBiography = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.biography = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelBiography = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.biography = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.biography = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);