angular.module('app')
    .controller('PostCategoryController', ['$q', '$scope', '$rootScope', 'PostCategoryService', 'globals',
        function ($q, $scope, $rootScope, PostCategoryService, globals) {

            $scope.allPostCategories = PostCategoryService.getAllPostCategories();

            $scope.getAllPostCategories = function () {
                PostCategoryService.getAllPostCategoriesFromServer()
                    .success(function (resp) {
                        $scope.allPostCategories = PostCategoryService.updateAllPostCategories(resp.allPostCategories);
                        $rootScope.main.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                    })
            };

            $scope.getAllPostCategories();

            $rootScope.$on('postCategoryChanges', function () {
                $scope.allPostCategories = PostCategoryService.getAllPostCategories();
            })
        }
    ]);