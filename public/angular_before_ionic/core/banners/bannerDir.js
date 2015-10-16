angular.module('app')
    .directive('signInBannerScope', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope) {
                $scope.signInBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('signInBanner', function (event, banner) {
                    $scope.signInBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.signInBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                });
            }
        };
    }])
    .directive('registrationBannerScope', ['$rootScope', function ($rootScope) {
        return {
            restrict: 'AE',
            link: function ($scope) {
                $scope.registrationBanner = {
                    show: false,
                    bannerClass: "",
                    msg: ""
                };

                $rootScope.$on('registrationBanner', function (event, banner) {
                    $scope.registrationBanner = banner;
                });

                $rootScope.$on('clearBanners', function () {
                    $scope.registrationBanner = {
                        show: false,
                        bannerClass: "",
                        msg: ""
                    };
                });
            }
        };
    }]);