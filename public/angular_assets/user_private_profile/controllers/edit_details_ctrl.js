angular.module('app')
    .controller('EditDetailsController', ['$filter', '$window', '$location', '$scope', '$rootScope', '$http', 'ngDialog',
        function ($filter, $window, $location, $scope, $rootScope, $http, ngDialog) {

            $scope.main = {
                mainCollapse: {
                    fullName: true,
                    email: true,
                    username: true,
                    statusLine: true,
                    biography: true
                },

                collapseAll: function () {
                    for (var t in this.mainCollapse) {
                        if (this.mainCollapse.hasOwnProperty(t)) {
                            this.mainCollapse[t] = true;
                        }
                    }
                },

                userData: {},
                userEditModel: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    username: '',
                    statusLine: '',
                    biography: ''
                },

                contentHasBeenEdited: false,

                isLoading: true, //initial loading state where everything loads
                showSpinner: false,
                showDone: false,
                isBusy: false,
                busy: function () {
                    this.showSpinner = true;
                    this.showDone = false;
                    this.isBusy = true;
                },
                done: function () {
                    var self = this;
                    self.showSpinner = false;
                    self.isBusy = false;
                    self.showDone = true;
                    Promise.delay(2000)
                        .then(function () {
                            self.showDone = false;
                        })
                },

                update: function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            var temp = {};
                            if ($scope.main.userEditModel.firstName.length > 0) {
                                temp.firstName = $scope.main.userEditModel.firstName;
                            }

                            if ($scope.main.userEditModel.lastName.length > 0) {
                                temp.lastName = $scope.main.userEditModel.lastName;
                            }

                            if ($scope.main.userEditModel.email.length > 0) {
                                temp.email = $scope.main.userEditModel.email;
                            }

                            if ($scope.main.userEditModel.username.length > 0) {
                                temp.username = $scope.main.userEditModel.username;
                            }

                            if ($scope.main.userEditModel.statusLine.length > 0) {
                                temp.statusLine = $scope.main.userEditModel.statusLine;
                            }

                            if ($scope.main.userEditModel.biography.length > 0) {
                                temp.biography = $scope.main.userEditModel.biography;
                            }

                            return $http.post('/api/updateUserDetails', {
                                data: temp
                            });
                        })
                        .then(function (obj) {
                            obj = obj.data;
                            $rootScope.main.responseStatusHandler(obj);
                            return $scope.main.getUserData();
                        })
                        .then(function () {
                            $scope.main.collapseAll();
                            $scope.main.done();
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            $scope.main.done();
                        });
                },

                passwordEditModel: {
                    oldPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                },

                updateUserPassword: function () {
                    if (this.passwordEditModel.oldPassword && this.passwordEditModel.newPassword && this.passwordEditModel.confirmNewPassword) {
                        return Promise.resolve()
                            .then(function () {
                                $scope.main.busy();
                                return Promise.delay(1000);
                            })
                            .then(function () {
                                var temp = {
                                    oldPassword: $scope.main.passwordEditModel.oldPassword,
                                    newPassword: $scope.main.passwordEditModel.newPassword,
                                    confirmNewPassword: $scope.main.passwordEditModel.confirmNewPassword
                                };
                                return $http.post('/api/updateUserPassword', {
                                    data: temp
                                });
                            })
                            .then(function (obj) {
                                obj = obj.data;
                                $rootScope.main.responseStatusHandler(obj);
                            })
                            .then(function () {
                                $scope.main.passwordEditModel.oldPassword = '';
                                $scope.main.passwordEditModel.newPassword = '';
                                $scope.main.passwordEditModel.confirmNewPassword = '';
                                $scope.main.done();
                            })
                            .catch(function (err) {
                                err = err.data;
                                $rootScope.main.responseStatusHandler(err);
                                $scope.main.done();
                            });
                    }
                },

                getUserData: function () {
                    return Promise.resolve()
                        .then(function () {
                            return $http.get('/api/getUserData');
                        })
                        .then(function (obj) {
                            obj = obj.data;
                            if (!obj.userData) {
                                $rootScope.main.redirectToLogin();
                            } else {
                                $scope.main.userData = obj.userData;
                                return Promise.delay(1000)
                                    .then(function () {
                                        $scope.main.isLoading = false;
                                    });
                            }
                        })
                }
            };

            $scope.main.getUserData()
                .catch(function (err) {
                    err = err.data;
                    $rootScope.main.responseStatusHandler(err);
                    $scope.main.done();
                });

            //watch if user has edited any thing and mark it as edited
            $scope.$watch(function () {
                return $scope.main.mainCollapse;
            }, function (newVal, oldVal) {
                var isEdited = false;
                if (newVal) {
                    for (var p in newVal) {
                        if (newVal.hasOwnProperty(p)) {
                            if (newVal[p] === false) {
                                isEdited = true;
                            }
                        }
                    }
                }

                $scope.main.contentHasBeenEdited = isEdited;

            }, true);
        }
    ]);