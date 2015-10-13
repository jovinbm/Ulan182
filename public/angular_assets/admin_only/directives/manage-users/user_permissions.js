angular.module('app')
    .controller('userPermissionsController', ['$rootScope', '$scope', 'ngTableParams', '$http', function ($rootScope, $scope, ngTableParams, $http) {

        $scope.main = {
            users: [],
            userData: {},
            loadingUser: false,
            searchModel: {
                query: ''
            },

            getUserData: function () {
                return Promise.resolve()
                    .then(function () {
                        $scope.main.loadingUser = true;
                        return $http.get('/api/getUserData');
                    })
                    .then(function (obj) {
                        obj = obj.data;
                        if (!obj.userData) {
                            $rootScope.main.redirectToLogin();
                        } else {
                            $scope.main.userData = obj.userData;
                        }
                        $scope.main.loadingUser = false;
                    })
            },

            getUserWithUniqueCuid: function (uniqueCuid) {
                $scope.main.loadingUser = true;
                return $http.post('/api/getUserWithUniqueCuid', {
                    uniqueCuid: uniqueCuid
                })
                    .then(function (resp) {
                        resp = resp.data;
                        $rootScope.main.responseStatusHandler(resp);
                        $scope.main.loadingUser = false;
                        if (!resp.userData) {
                            return {};
                        } else {
                            return resp.userData;
                        }
                    })
                    .catch(function (err) {
                        err = err.data;
                        $scope.main.loadingUser = false;
                        throw err;
                    })
            },

            permissions: {},

            getAllPermissions: function () {
                return $http.post('/api/getAllUserPermissions');
            },

            //this is na object whose keys are permissions id's, and
            //value as of now are isChecked
            userPermissionsModel: {},

            prepareUserPermissionsModel: function (user) {
                var userPermissions = user.adminLevels;
                return Promise.resolve()
                    .then(function () {
                        for (var key in $scope.main.permissions) {
                            if ($scope.main.permissions.hasOwnProperty(key)) {
                                if (userPermissions.indexOf(parseInt(key)) > -1) {
                                    $scope.main.userPermissionsModel[key] = {};
                                    $scope.main.userPermissionsModel[key].isChecked = true;
                                } else {
                                    $scope.main.userPermissionsModel[key] = {};
                                    $scope.main.userPermissionsModel[key].isChecked = false;
                                }
                            }
                        }

                        return user;
                    })
            },

            userToDisplay: {},

            changeUserToDisplay: function (uniqueCuid) {
                return Promise.resolve()
                    .then(function () {
                        return $scope.main.getUserData();
                    })
                    .then(function () {
                        return $scope.main.getUserWithUniqueCuid(uniqueCuid);
                    })
                    .then(function (user) {
                        return $scope.main.prepareUserPermissionsModel(user);
                    })
                    .then(function (user) {
                        $scope.main.userToDisplay = user;
                    })
                    .catch(function (err) {
                        $rootScope.main.responseStatusHandler(err);
                        console.log(err);
                    })
            }
        };

        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        }, {
            total: 0,
            counts: [10, 20, 40, 80],

            getData: function ($defer, params) {

                getUsers({
                    query: $scope.main.searchModel.query,
                    requestedPage: params.page(),
                    quantity: params.count()
                })
                    .then(function (data) {
                        if (data) {
                            var resultObj = data.resultObj;
                            params.total(resultObj.totalResults);
                            params.page(resultObj.page);
                            $scope.main.users = resultObj.users;
                            $defer.resolve($scope.main.users);
                        } else {
                            $scope.main.users = [];
                            params.page(1); //set the page back to one
                            $defer.resolve($scope.main.users);
                        }
                    });

            }
        });

        function getUsers(options) {

            return Promise.resolve()
                .then(function () {
                    return $scope.main.getAllPermissions()
                        .success(function (data) {
                            $rootScope.main.responseStatusHandler(data);
                            $scope.main.permissions = data.permissions;
                        })
                        .error(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                            throw {
                                code: 600
                            }
                        });
                })
                .then(function () {
                    if (!options.query) {
                        options.query = 'all'; //return all users
                    }

                    if (!options.requestedPage) {
                        options.requestedPage = 1;
                    }

                    if (!options.quantity) {
                        options.quantity = 10
                    }
                    return $http.post('/api/searchUsers', {
                        query: options.query,
                        requestedPage: options.requestedPage,
                        quantity: options.quantity
                    })
                        .then(function (data) {
                            data = data.data;
                            $rootScope.main.responseStatusHandler(data);
                            return data;
                        })
                        .catch(function (err) {
                            err = err.data;
                            console.log(err);
                            $rootScope.main.responseStatusHandler(err);
                            return null;
                        })

                })
                .catch(function (err) {
                    return null;
                })
        }

    }])

    .directive('userDirective', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {


                $scope.updateUserPermissions = function (userUniqueCuid, userPermissionsModel) {
                    $scope.main.loadingUser = true; //this will ultimately be changed by changeUserToDisplay -- getUserData

                    return Promise.resolve()
                        .then(function () {
                            return new Promise(function (resolve, reject) {
                                if (userPermissionsModel) {
                                    var permissionsArray = [];

                                    for (var key in userPermissionsModel) {
                                        if (userPermissionsModel.hasOwnProperty(key)) {
                                            if (userPermissionsModel[key].isChecked) {
                                                permissionsArray.push(parseInt(key));
                                            }
                                        }
                                    }

                                    resolve(permissionsArray);

                                } else {
                                    reject({
                                        code: 600,
                                        err: 'userPermissionsModel = ' + userPermissionsModel
                                    });
                                }
                            })
                        })
                        .then(function (newPermissionsArray) {
                            return $http.post('/api/updateUserPermissions', {
                                userUniqueCuid: userUniqueCuid,
                                newPermissionsArray: newPermissionsArray
                            })
                                .then(function (resp) {
                                    resp = resp.data;
                                    return resp;
                                })
                                .catch(function (err) {
                                    err = err.data;
                                    throw err
                                })
                        })
                        .then(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                            return $scope.main.changeUserToDisplay(userUniqueCuid);
                        })
                        .catch(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                            console.log(err);
                        })
                };

                $scope.resetPermissionChanges = function (userUniqueCuid) {
                    //this will do everything from refreshing the user to refreshing their permissions
                    return $scope.main.changeUserToDisplay(userUniqueCuid);
                }

            }
        }
    }])

    .directive('userActions', ['$rootScope', '$http', 'UserService', 'ngDialog', function ($rootScope, $http, UserService, ngDialog) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {


                $scope.approveUser = function (userUniqueCuid) {
                    UserService.approveUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                };


                $scope.banUser = function (userUniqueCuid) {
                    UserService.banUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                };


                $scope.unBanUser = function (userUniqueCuid) {
                    UserService.unBanUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                };

                $scope.deleteUser = function (userUniqueCuid) {
                    return Promise.resolve()
                        .then(function () {
                            return ngDialog.openConfirm({
                                template: '/views/dialogs/confirm-delete-user.html',
                                className: 'ngdialog-theme-default',
                                overlay: true,
                                showClose: false,
                                closeByEscape: false,
                                closeByDocument: false,
                                cache: true,
                                trapFocus: true,
                                preserveFocus: true
                            })
                        })
                        .catch(function () {
                            $scope.main.showToast('success', 'Deletion cancelled');
                            throw {
                                code: 600
                            }
                        })
                        .then(function () {
                            return $http.post('/api/deleteUser', {
                                userUniqueCuid: userUniqueCuid
                            })
                                .catch(function (err) {
                                    err = err.data;
                                    $rootScope.main.responseStatusHandler(err);
                                    throw err;
                                })
                                .then(function (resp) {
                                    resp = resp.data;
                                    $rootScope.main.responseStatusHandler(resp);
                                    return resp;
                                })
                        })
                        .then(function () {
                            //reload this page
                            //sometimes the user may have deleted themselves so you want to counter that
                            $rootScope.main.reloadPage();
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                };
            }
        }
    }]);