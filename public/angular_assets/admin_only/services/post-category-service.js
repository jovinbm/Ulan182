angular.module('app')
    .factory('PostCategoryService', ['$http', '$rootScope',
        function ($http, $rootScope) {

            var allPostCategories = {};

            return {

                getAllPostCategories: function () {
                    return allPostCategories;
                },

                getAllPostCategoriesFromServer: function () {
                    return $http.post('/api/category/posts/all', {})
                },

                updateAllPostCategories: function (newPostCategories) {
                    allPostCategories = newPostCategories;
                    $rootScope.$broadcast('postCategoryChanges');
                    return allPostCategories;
                }
            };
        }
    ]);