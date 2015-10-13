function trackDigests(app) {
    app.run(["$rootScope", function ($rootScope) {
        Promise.setScheduler(function (cb) {
            $rootScope.$evalAsync(cb);
        });
    }]);
}

//angular sanitize included in textAngular
var app = angular.module('app', [
    'ngSanitize',
    'ui.bootstrap',
    'angularUtils.directives.dirDisqus',
    'toastr',
    'ngDialog',
    'ngTable',
    'LocalStorageModule'
])
    .config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true
        });
    }]);

trackDigests(app);