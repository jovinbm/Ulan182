angular.module('app')
    .directive('userDisplay', ['$rootScope', 'UserService', '$http', function ($rootScope, UserService, $http) {
        return {
            templateUrl: 'user_display.html',
            restrict: 'AE',
            scope: {
                user: '='
            },
            link: function ($scope, $element, $attrs) {
                //$scope.user included in scope

                $scope.isCollapsed = true;

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

                    function resendConfirmationEmail(userUniqueCuid) {
                        return $http.post('/resendConfirmationEmail', {
                            userUniqueCuid: userUniqueCuid
                        });
                    }
                };

                //user manipulation functions
                $scope.addAdminPrivileges = function (userUniqueCuid) {
                    UserService.addAdminPrivileges(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
                $scope.removeAdminPrivileges = function (userUniqueCuid) {
                    UserService.removeAdminPrivileges(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
                $scope.approveUser = function (userUniqueCuid) {
                    UserService.approveUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
                $scope.banUser = function (userUniqueCuid) {
                    UserService.banUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
                $scope.unBanUser = function (userUniqueCuid) {
                    UserService.unBanUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
            }
        }
    }]);