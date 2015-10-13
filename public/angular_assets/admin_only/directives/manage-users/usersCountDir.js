angular.module('app')
    .directive('usersCount', ['$q', '$log', '$rootScope', 'globals', function ($q, $log, $rootScope, globals) {
        return {
            templateUrl: 'user_statistics.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.$on('userChanges', function () {
                });
            }
        }
    }]);