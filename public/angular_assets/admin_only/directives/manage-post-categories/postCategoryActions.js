angular.module('app')
    .directive('postCategoryActionsScope', ['$q', '$log', '$rootScope', '$http', 'globals', 'ngDialog', function ($q, $log, $rootScope, $http, globals, ngDialog) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.categoryNameModel = {
                    name: ""
                };

                $scope.addPostCategory = function () {
                    if ($scope.categoryNameModel.name.length > 0) {
                        var dialog = $scope.main.showExecuting('Adding');
                        $http.post('/api/newPostCategory', $scope.categoryNameModel)
                            .success(function (resp) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.categoryNameModel.name = "";
                                //function from post category controller, it will update and broadcast an event on success
                                $scope.getAllPostCategories();
                            })
                            .error(function (errResponse) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    } else {
                        $rootScope.main.showToast('warning', 'Please enter the category name');
                    }
                };

                $scope.editPostCategoryName = function (postCategoryUniqueCuid, postCategoryName) {
                    ngDialog.openConfirm({
                        data: {
                            postCategoryName: postCategoryName
                        },
                        template: 'edit_post_category_name',
                        className: 'ngdialog-theme-default',
                        overlay: true,
                        showClose: true,
                        closeByEscape: true,
                        closeByDocument: true,
                        cache: true,
                        trapFocus: true,
                        preserveFocus: true
                    }).then(function (name) {
                        if (name && name.length > 0) {
                            continueEditing(name);
                        } else {
                            $scope.main.showToast('warning', 'Please enter a name');
                        }
                    }, function () {
                        $scope.main.showToast('success', 'Edit cancelled');
                    });
                    function continueEditing(name) {
                        var dialog = $scope.main.showExecuting('Saving');
                        $http.post('/api/editPostCategoryName', {
                            updatedPostCategoryName: name,
                            postCategoryUniqueCuid: postCategoryUniqueCuid
                        })
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                dialog.close();
                                //function from post category controller, it will update and broadcast an event on success
                                $scope.getAllPostCategories();
                            })
                            .error(function (errResponse) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(errResponse);
                            });
                    }
                };
                $scope.deletePostCategory = function (postCategoryUniqueCuid, postCategoryName) {
                    ngDialog.openConfirm({
                        data: {
                            postCategoryName: postCategoryName
                        },
                        template: 'confirm_delete_post_category',
                        className: 'ngdialog-theme-default',
                        overlay: true,
                        showClose: true,
                        closeByEscape: true,
                        closeByDocument: true,
                        cache: true,
                        trapFocus: true,
                        preserveFocus: true
                    }).then(function () {
                        continueDeleting();
                    }, function () {
                        $scope.main.showToast('success', 'Deletion cancelled')
                    });
                    function continueDeleting() {
                        var dialog = $scope.main.showExecuting('Deleting');
                        $http.post('/api/deletePostCategory', {
                            postCategoryUniqueCuid: postCategoryUniqueCuid
                        })
                            .success(function (resp) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.categoryNameModel.name = "";
                                //function from post category controller, it will update and broadcast an event on success
                                $scope.getAllPostCategories();
                            })
                            .error(function (errResponse) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };
            }
        }
    }]);