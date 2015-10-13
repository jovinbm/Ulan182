angular.module('app')
    .directive('changePostCategoryScope', ['$rootScope', '$http', 'ngDialog', 'ngTableParams', function ($rootScope, $http, ngDialog, ngTableParams) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //category details is field by ui select
                $scope.categoryModel = {
                    categoryDetails: {},
                    categoryPosts: [],
                    postsToChange: []
                };

                $scope.categoryPostsTableParams = new ngTableParams({
                    page: 1,            // show first page
                    count: 10           // count per page
                }, {
                    total: 0,
                    counts: [10, 20, 40, 80],

                    getData: function ($defer, params) {

                        getCategoryPosts({
                            postCategoryUniqueCuid: $scope.categoryModel.categoryDetails.postCategoryUniqueCuid,
                            requestedPage: params.page(),
                            quantity: params.count()
                        })
                            .then(function (resp) {
                                if (resp) {
                                    var resObj = resp.resObj;
                                    params.total(resObj.totalResults);
                                    params.page(resObj.page);
                                    $scope.categoryModel.categoryPosts = resObj.posts;
                                    $defer.resolve($scope.categoryModel.categoryPosts);
                                } else {
                                    $scope.categoryModel.categoryPosts = [];
                                    params.page(1); //set the page back to one
                                    $defer.resolve($scope.categoryModel.categoryPosts);
                                }
                            });

                    }
                });

                function getCategoryPosts(options) {

                    return Promise.resolve()
                        .then(function () {

                            if (!options.postCategoryUniqueCuid) { //only do this if the postCategoryUniqueCuid is defined
                                options.postCategoryUniqueCuid = 'abc';
                            }

                            if (!options.requestedPage) {
                                options.requestedPage = 1;
                            }

                            if (!options.quantity) {
                                options.quantity = 10
                            }

                            return $http.post('/api/getPostsInCategory', {
                                postCategoryUniqueCuid: options.postCategoryUniqueCuid,
                                requestedPage: options.requestedPage,
                                quantity: options.quantity
                            })
                                .then(function (resp) {
                                    resp = resp.data;
                                    $rootScope.main.responseStatusHandler(resp);
                                    return resp;
                                })
                                .catch(function (err) {
                                    err = err.data;
                                    console.log(err);
                                    $rootScope.main.responseStatusHandler(err);
                                    return null;
                                })

                        })
                        .then(function (resp) {
                            return resp;
                        })
                        .catch(function (err) {
                            console.log(err);
                            $rootScope.showToast('warning', err.msg || 'An error occurred, Please try again');
                            return null;
                        })
                }

                $scope.loadUncategorizedPosts = function () {
                    var dialog = $scope.main.showExecuting('Loading');
                    $http.post('/api/getPostsWithNoCategory')
                        .success(function (resp) {
                            dialog.close();
                            $rootScope.main.responseStatusHandler(resp);
                            $scope.categoryModel.categoryPosts = resp.postsArray;
                            $scope.categoryModel.categoryDetails = {};
                        })
                        .error(function (errResponse) {
                            dialog.close();

                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };

                $scope.selectAll = function () {
                    $scope.categoryModel.categoryPosts.forEach(function (post, index) {
                        post.isChecked = true;
                    });
                };

                $scope.unselectAll = function () {
                    $scope.categoryModel.categoryPosts.forEach(function (post, index) {
                        post.isChecked = false;
                    });
                };

                $scope.moveSelected = function () {
                    $scope.categoryModel.categoryPosts.forEach(function (post, index) {
                        if (post.isChecked) {
                            $scope.categoryModel.postsToChange.push(post.postUniqueCuid);
                        }
                    });

                    if ($scope.categoryModel.postsToChange.length > 0) {
                        ngDialog.openConfirm({
                            data: {
                                allCategories: $scope.allPostCategories.allPostCategoriesData
                            },
                            template: 'move_category_select_destination',
                            className: 'ngdialog-theme-default',
                            overlay: true,
                            showClose: true,
                            closeByEscape: true,
                            closeByDocument: true,
                            cache: true,
                            trapFocus: true,
                            preserveFocus: true
                        }).then(function (postCategoryUniqueCuid) {
                            continueMoving(postCategoryUniqueCuid);
                        }, function () {
                            $scope.main.showToast('success', 'Move cancelled');
                        });

                        function continueMoving(postCategoryUniqueCuid) {
                            var dialog = $scope.main.showExecuting('Saving');
                            return $http.post('/api/multiChangePostCategory', {
                                postUniqueCuidArray: $scope.categoryModel.postsToChange,
                                postCategoryUniqueCuid: postCategoryUniqueCuid
                            })
                                .success(function (resp) {
                                    dialog.close();
                                    $rootScope.main.responseStatusHandler(resp);

                                    //empty the posts to change!
                                    $scope.categoryModel.postsToChange = [];

                                    //function from post category controller, it will update and broadcast an event on success
                                    $scope.getAllPostCategories();
                                })
                                .error(function (errResponse) {
                                    dialog.close();
                                    $rootScope.main.responseStatusHandler(errResponse);
                                });
                        }
                    } else {
                        $scope.main.showToast('warning', 'Please select posts to move')
                    }
                }
            }
        }
    }]);