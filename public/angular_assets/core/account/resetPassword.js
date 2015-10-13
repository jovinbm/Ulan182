angular.module('app')
    .directive('resetPasswordScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.resetMain = {
                    isBusy: false
                };

                $scope.resetFormModel = {
                    email: "",
                    newPassword: "",
                    confirmNewPassword: ""
                };

                //this is the first step
                $scope.submitResetPasswordEmail = function () {
                    $scope.resetMain.isBusy = true;
                    return $http.post('/api/resetPassword/email', $scope.resetFormModel)
                        .then(function (resp) {
                            resp = resp.data;
                            $rootScope.main.responseStatusHandler(resp);
                            //don't remove isBusy here to prevent the user from submitting the details again
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            $scope.resetFormModel.email = "";
                            $scope.resetFormModel.newPassword = "";
                            $scope.resetFormModel.confirmNewPassword = "";
                            $scope.resetMain.isBusy = false;
                        });
                };
            }
        };
    }]);