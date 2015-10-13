angular.module('app')
    .directive('unApprovedUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'unApproved_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.usersNotApprovedModel = {
                    filterString: ""
                };
                $scope.usersNotApproved = UserService.getUsersNotApproved();

                function getUsersNotApproved() {
                    UserService.getUsersNotApprovedFromServer()
                        .success(function (resp) {
                            $scope.usersNotApproved = UserService.updateUsersNotApproved(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                }
                getUsersNotApproved();

                $rootScope.$on('userChanges', function () {
                    getUsersNotApproved();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);