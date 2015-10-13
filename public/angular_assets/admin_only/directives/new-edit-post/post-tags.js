angular.module('app')
    .directive('postTags', ['$filter', function ($filter) {
        return {
            templateUrl: 'post_tags.html',
            scope: {
                postTags: '=model'
            },
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                //post Tags is already in scope
            }
        }
    }]);
