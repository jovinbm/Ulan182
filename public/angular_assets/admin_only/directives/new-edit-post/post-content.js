angular.module('app')
    .directive('postContent', [function () {
        return {
            templateUrl: 'post_content.html',
            scope: {
                postContent: '=model'
            },
            restrict: 'AE',
            link: function ($scope) {
                $scope.preparedPostContent = $scope.postContent;
                $scope.$watch('postContent', function () {
                    $scope.preparedPostContent = $scope.postContent;
                });
            }
        };
    }]);