angular.module('app')
    .directive('imageAdDirective', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                var adsize = $attrs.adsize.toString();
                var display = s.words($attrs.display);  //s is underscore string library

                var width = $(window).width();

                if (width >= 1200 && display.indexOf('lg') > -1) {
                    putImageAd();
                } else if (width >= 992 && width < 1200 && display.indexOf('md') > -1) {
                    putImageAd();
                } else if (width >= 768 && width < 992 && display.indexOf('sm') > -1) {
                    putImageAd();
                } else if (width < 768 && display.indexOf('xs') > -1) {
                    putImageAd();
                } else {
                    //don't display
                }

                function putImageAd() {
                    Promise.resolve()
                        .then(function () {
                            return $http.post('/ad/imageAdHtml', {
                                size: adsize
                            })
                                .catch(function (e) {
                                    e = e.data;
                                    $rootScope.main.responseStatusHandler(e);
                                    throw e;
                                })
                                .then(function (resp) {
                                    resp = resp.data;
                                    $rootScope.main.responseStatusHandler(resp);
                                    return resp;
                                });
                        })
                        .then(function (html) {
                            $element.empty();
                            $element.append(html);
                        })
                        .catch(function (e) {
                            console.log(e);
                        });
                }
            }
        };
    }]);