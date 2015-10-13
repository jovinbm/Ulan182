angular.module('app')
    .directive('newPostDirectiveScope', ['$filter', '$rootScope', 'PostService', 'globals', '$http', '$interval', 'ngDialog', function ($filter, $rootScope, PostService, globals, $http, $interval, ngDialog) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                var thisUser = {};

                /*get userData from the server again. This makes sure that the userData is available
                 * why? sometimes the controller loads faster than the initial requests*/
                globals.userDataFromServer()
                    .success(function (resp) {
                        $rootScope.main.responseStatusHandler(resp);
                        if (!resp.userData) {
                            $rootScope.main.redirectToLogin();
                        } else {
                            thisUser = resp.userData;
                            continueRendering();
                        }
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                    });

                function continueRendering() {

                    //postType can either be normal, video or art

                    $scope.postModel = {
                        allPostCategories: [],
                        postCategoryUniqueCuid: "",
                        postHeading: "",
                        postContent: "",
                        postSummary: "",
                        postTags: [],
                        postUploads: [],
                        postShortHeading: '',
                        postHeaderImageKey: '',
                        postType: 'normal',
                        authorUniqueCuid: thisUser.uniqueCuid,
                        writers: [],
                        step: 1

                    };

                    $scope.previousStep = function () {
                        $scope.postModel.step--;
                        $rootScope.main.goToTop();
                    };

                    $scope.incrementStep = function () {
                        $scope.postModel.step++;
                        $rootScope.main.goToTop();
                    };


                    $scope.nextStep = function (currentStep) {
                        //step 1 involves choosing the post category
                        if (parseInt(currentStep) == 1) {
                            if ($scope.postModel.postCategoryUniqueCuid.length == 0) {
                                $rootScope.main.showToast('warning', 'Please select a category');
                            } else if ($scope.postModel.postType.length == 0) {
                                $rootScope.main.showToast('warning', 'Please select the post type');
                            } else {
                                $scope.incrementStep();
                            }
                        }

                        //step 2 involves writing the post itself
                        if (parseInt(currentStep) == 2) {
                            if ($scope.validateMainPostForm(true)) {
                                $scope.incrementStep();
                            }
                        }

                        //step 2 involves finalizing the post
                        if (parseInt(currentStep) == 3) {
                            if ($scope.validateFinalizePostForm(true)) {
                                $scope.incrementStep();
                            }
                        }
                    };


                    $scope.getAllPostCategories = function () {
                        $http.post('/api/getPostCategories')
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.postModel.allPostCategories = resp.postCategoriesArray;
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    };
                    $scope.getAllWriters = function () {
                        $http.post('/api/getWriters')
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.postModel.writers = resp.usersArray;
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    };
                    $scope.getAllPostCategories();
                    $scope.getAllWriters();

                    //broadcast here helps distinguish from the inform checking and the checking on submit, which requires notifications
                    //broadcast takes a boolean value
                    $scope.validateMainPostForm = function (notify) {
                        var errors = 0;
                        if (!$filter("validatePostHeading")($scope.postModel.postHeading, notify)) {
                            errors++;
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostContent")($scope.postModel.postContent, notify)) {
                                errors++;
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostTags")($scope.postModel.postTags, notify)) {
                                errors++;
                            }
                        }
                        return errors == 0;
                    };

                    $scope.validateFinalizePostForm = function (notify) {
                        var errors = 0;
                        if (errors == 0) {
                            if (!$scope.postModel.postHeaderImageKey || $scope.postModel.postHeaderImageKey.length == 0) {
                                errors++;
                                $rootScope.main.showToast('warning', 'Please select the header image');
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostShortHeading")($scope.postModel.postShortHeading, notify)) {
                                errors++;
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostSummary")($scope.postModel.postSummary, notify)) {
                                errors++;
                            }
                        }
                        return errors == 0;
                    };


                    $scope.submitFinal = function () {
                        if ($scope.validateMainPostForm(true)) {

                            //$scope.incrementStep();

                            PostService.submitNewPost($scope.postModel).
                                success(function (resp) {
                                    var thePost = resp.thePost;
                                    $rootScope.main.responseStatusHandler(resp);
                                    $rootScope.main.redirectToPage('/post/' + $filter('getSlugUrl')(thePost));
                                })
                                .error(function (errResponse) {
                                    $scope.previousStep();
                                    $rootScope.main.responseStatusHandler(errResponse);
                                    $rootScope.main.goToTop();
                                })
                        } else {
                            $rootScope.main.goToTop();
                        }
                    };

                    $scope.cancel = function () {
                        ngDialog.openConfirm({
                            template: 'confirm_cancel_new_post',
                            className: 'ngdialog-theme-default',
                            overlay: true,
                            showClose: true,
                            closeByEscape: true,
                            closeByDocument: true,
                            cache: true,
                            trapFocus: true,
                            preserveFocus: true
                        }).then(function () {
                            $rootScope.main.redirectToHome();
                        }, function () {
                            //do nothing
                        });
                    };
                }

                /*end of continue rendering*/
            }
        }
    }]);