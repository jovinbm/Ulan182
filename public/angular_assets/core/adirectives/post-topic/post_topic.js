angular.module('app')
    .directive('postTopicScope', ['$rootScope', '$http', function ($rootScope, $http) {

        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.theModel = JSON.parse($scope.model);

                function getPostTopic(pageNumber) {
                    $scope.mainTopicModel = {
                        topic: $scope.theModel.topic,
                        requestedPage: pageNumber
                    };


                    if ($scope.mainTopicModel.topic && $scope.mainTopicModel.requestedPage) {
                        $scope.buttonLoading();
                        topicSearch($scope.mainTopicModel)
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.theModel.pageNumber++;
                                angular.element('#appendNextPosts').replaceWith(resp);
                                $scope.finishedLoading();
                            })
                            .error(function (errResp) {
                                $rootScope.main.responseStatusHandler(errResp);
                                $scope.finishedLoading();
                            });
                    }
                }

                function topicSearch(topicObject) {
                    var topic = topicObject.topic;
                    var pageNumber = topicObject.requestedPage;
                    return $http.get('/partial/topic/' + topic + '?page=' + parseInt(pageNumber));
                }


                $scope.showMore = function () {
                    getPostTopic(parseInt($scope.theModel.pageNumber) + 1);
                };

                //button loading state
                $scope.buttonLoading = function () {
                    $('#showMoreBtn').button('loading');
                };
                $scope.finishedLoading = function () {
                    $('#showMoreBtn').button('reset');
                };
            }
        };
    }]);