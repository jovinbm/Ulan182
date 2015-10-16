angular.module('app')
    .directive('universalBannerScope', ['$rootScope', 'globals', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope) {
                $scope.universalBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('universalBanner', function (event, banner) {
                    $scope.universalBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.universalBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                });
            }
        };
    }]);