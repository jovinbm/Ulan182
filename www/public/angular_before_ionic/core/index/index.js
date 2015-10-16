angular.module('app')
    .controller('indexController', ['$rootScope', '$http', function ($rootScope, $http) {
        $rootScope.main.classes.body = 'index';
    }])
    .directive('indexnScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {
            }
        };
    }]);