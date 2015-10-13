angular.module('app')
    .controller('UserManagerController', ['$q', '$scope', '$rootScope', 'UserService', 'globals',
        function ($q, $scope, $rootScope, UserService) {

            $scope.usersCount = UserService.getUsersCount();

            function getUsersCount() {
                UserService.getUsersCountFromServer()
                    .success(function (resp) {
                        $scope.usersCount = UserService.updateUsersCount(resp.usersCount);
                        $rootScope.main.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                    });
            }

            getUsersCount();
        }
    ]);