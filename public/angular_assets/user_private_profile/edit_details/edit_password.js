angular.module('app')
    .directive('editPasswordDirective', ['$rootScope', 'globals', '$http', function ($rootScope, globals, $http) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.updatePassword = function () {
                    Promise.resolve()
                        .then(function () {
                            return $scope.main.updateUserPassword();
                        });
                };

            }
        }
    }]);