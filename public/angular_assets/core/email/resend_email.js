angular.module('app')
    .directive('resendEmailScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.resendConfirmationEmail = function (userUniqueCuid) {
                    var dialog = $rootScope.main.showExecuting('Sending Email');
                    resendConfirmationEmail(userUniqueCuid)
                        .success(function (resp) {
                            dialog.close();
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            dialog.close();
                            $rootScope.main.responseStatusHandler(err);
                        });
                };

                function resendConfirmationEmail(userUniqueCuid) {
                    return $http.post('/resendConfirmationEmail', {
                        userUniqueCuid: userUniqueCuid
                    });
                }
            }
        };
    }]);