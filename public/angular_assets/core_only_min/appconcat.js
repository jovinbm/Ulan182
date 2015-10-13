function trackDigests(app) {
    app.run(["$rootScope", function ($rootScope) {
        Promise.setScheduler(function (cb) {
            $rootScope.$evalAsync(cb);
        });
    }]);
}

//angular sanitize included in textAngular
var app = angular.module('app', [
    'ngSanitize',
    'ui.bootstrap',
    'angularUtils.directives.dirDisqus',
    'toastr',
    'ngDialog',
    'ngTable',
    'LocalStorageModule'
])
    .config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true
        });
    }]);

trackDigests(app);
angular.module('app')
    .directive('createAccountScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {
                $scope.createMain = {
                    isBusy: false
                };

                $scope.registrationDetails = {
                    email: "",
                    firstName: "",
                    lastName: "",
                    username: "",
                    password1: "",
                    password2: ""
                };

                $scope.createAccount = function (redirect) {
                    $scope.createMain.isBusy = true;
                    return createAccount($scope.registrationDetails, redirect)
                        .then(function () {
                            $scope.createMain.isBusy = false;
                        });
                };

                function createAccount(details) {
                    return $http.post('/createAccount', details)
                        .then(function (resp) {
                            resp = resp.data;
                            $rootScope.main.responseStatusHandler(resp);
                            return true;
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            $scope.registrationDetails.password1 = "";
                            $scope.registrationDetails.password2 = "";
                            return true;
                        });
                }
            }
        };
    }]);
angular.module('app')
    .directive('resetPasswordScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.resetMain = {
                    isBusy: false
                };

                $scope.resetFormModel = {
                    email: "",
                    newPassword: "",
                    confirmNewPassword: ""
                };

                //this is the first step
                $scope.submitResetPasswordEmail = function () {
                    $scope.resetMain.isBusy = true;
                    return $http.post('/api/resetPassword/email', $scope.resetFormModel)
                        .then(function (resp) {
                            resp = resp.data;
                            $rootScope.main.responseStatusHandler(resp);
                            //don't remove isBusy here to prevent the user from submitting the details again
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            $scope.resetFormModel.email = "";
                            $scope.resetFormModel.newPassword = "";
                            $scope.resetFormModel.confirmNewPassword = "";
                            $scope.resetMain.isBusy = false;
                        });
                };
            }
        };
    }]);
angular.module('app')
    .directive('signInScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.signInMain = {
                    isBusy: false
                };

                $scope.loginFormModel = {
                    username: "",
                    password: ""
                };

                $scope.submitLocalLoginForm = function (redirect) {
                    $scope.signInMain.isBusy = true;
                    return localUserLogin($scope.loginFormModel, redirect)
                        .then(function () {
                            $scope.signInMain.isBusy = false;
                        });
                };

                function localUserLogin(loginData, redirect) {
                    return Promise.resolve()
                        .then(function () {
                            if (redirect) {
                                return $http.post('/localUserLogin?lastpage=' + document.referrer, loginData);
                            } else {
                                return $http.post('/localUserLogin', loginData);
                            }
                        })
                        .then(function (resp) {
                            resp = resp.data;
                            $rootScope.main.responseStatusHandler(resp);
                            return true;
                        })
                        .catch(function (err) {
                            err = err.data;
                            $scope.loginFormModel.password = "";
                            $rootScope.main.responseStatusHandler(err);
                            return true;
                        });
                }
            }
        };
    }]);
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
angular.module('app')
    .config(function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setPrefix('app')
            .setStorageCookieDomain(document.location.hostname.search("africanexponent") !== -1 ? 'africanexponent.com' : '')
            .setStorageType('localStorage');
    });

angular.module('app')
    .controller('UniversalController', ['$filter', '$window', '$location', '$scope', '$rootScope', 'ngDialog', '$anchorScroll', '$sce', 'localStorageService', '$http',
        function ($filter, $window, $location, $scope, $rootScope, ngDialog, $anchorScroll, $sce, localStorageService, $http) {

            $rootScope.main = {

                userLocationData: null,

                getUserLocationData: function () {

                    //localStorageKey is 'userLocation'

                    var html5GeoOptions = {
                        enableHighAccuracy: false,
                        timeout: 30000,
                        maximumAge: 86400 * 1000 //default to one day
                    };

                    Promise.resolve()
                        .then(function () {
                            return new Promise(function (resolve, reject) {

                                if ($rootScope.main.checkCookieIsEnabled()) {

                                    var loc;

                                    if (loc = $rootScope.main.getKeyFromCookie('userLocation', 86400 * 7)) {  //checks that the cookie is no more than 7 days old
                                        if (loc.hasOwnProperty('country') && loc.country) {
                                            resolve(true);
                                        } else {
                                            getNewLocationData();
                                        }
                                    } else {
                                        getNewLocationData();
                                    }

                                } else {
                                    console.log('Cookie not supported');
                                    var temp = {
                                        country: null
                                    };
                                    $rootScope.main.saveKeyToCookie('userLocation', temp, 7); //save for next viewed page
                                    resolve(true);
                                }

                                function getNewLocationData() {
                                    geolocator.locateByIP(found, geoError, 2); //true will cause it to fallback to ip address

                                    function found(locationData) {

                                        var temp = {
                                            country: locationData.address.country
                                        };
                                        $rootScope.main.saveKeyToCookie('userLocation', temp, 1); //save for next viewed page
                                        resolve(true);
                                    }

                                    function geoError(e) {
                                        var temp = {
                                            country: null
                                        };
                                        $rootScope.main.saveKeyToCookie('userLocation', temp, 1); //save for next viewed page
                                        reject(e);
                                    }
                                }
                            });
                        })
                        .catch(function (e) {
                            if (e.msg) {
                                console.log(e.msg);
                            }
                            else {
                                throw e;
                            }
                        })
                        .catch(function (e) {
                            console.log(e);
                        });
                },

                checkLocalStorageSupport: function () {
                    if (localStorageService.isSupported) {
                        return true;
                    } else {
                        return false;
                    }
                },

                checkCookieIsEnabled: function () {
                    if (localStorageService.cookie.isSupported) {
                        return true;
                    } else {
                        return false;
                    }
                },

                saveToLocalStorage: function (key, val) {
                    var object = {
                        value: val,
                        timestamp: new Date().getTime()
                    };
                    return localStorageService.set(key, object); //returns a boolean
                },

                getFromLocalStorage: function (key, maxAgeSeconds) {
                    if (!maxAgeSeconds) {
                        maxAgeSeconds = 86400; //default to one day
                    }
                    if ($rootScope.main.checkIfExistsOnLocalStorage(key)) {
                        var object = localStorageService.get(key);
                        var dateString = object.timestamp;
                        var now = new Date().getTime().toString();
                        if (now - dateString > (maxAgeSeconds * 1000)) {
                            $rootScope.main.removeFromLocalStorage([key]); //remove expired item from local storage
                            return false;
                        } else {
                            return object.value;
                        }
                    } else {
                        return false;
                    }
                },

                saveKeyToCookie: function (key, val, maxAgeInDays) {
                    if (!maxAgeInDays) {
                        maxAgeInDays = 2; //defaults to 2 day(s)
                    }
                    var object = {
                        value: val,
                        timestamp: new Date().getTime()
                    };
                    object = JSON.stringify(object);
                    return localStorageService.cookie.set(key, object, maxAgeInDays); //returns a boolean
                },

                getKeyFromCookie: function (key, maxAgeSeconds) {
                    if (!maxAgeSeconds) {
                        maxAgeSeconds = 86400; //default to one day
                    }
                    var object = localStorageService.cookie.get(key);
                    if (object) {
                        var dateString = object.timestamp;
                        var now = new Date().getTime().toString();
                        if ((now - dateString) > (maxAgeSeconds * 1000)) {
                            $rootScope.main.removeKeyFromCookie(key); //remove expired item from local storage
                            return false;
                        } else {
                            return object.value;
                        }
                    } else {
                        return false;
                    }
                },

                checkIfExistsOnLocalStorage: function (key) {
                    var keys = localStorageService.keys();
                    var len = keys.length;
                    var exists = false;
                    for (var i = 0; i < len; i++) {
                        if (keys[i] == key) {
                            exists = true;
                            break;
                        }
                    }
                    return exists;
                },

                removeFromLocalStorage: function (keyArray, all) {  //if all is true, it clears all keys
                    if (all) {
                        return localStorageService.clearAll();
                    } else {
                        keyArray.forEach(function (key) {
                            localStorageService.remove(key);
                        });
                    }

                    return true;
                },

                removeKeyFromCookie: function (key) {  //if all is true, it clears all keys
                    return localStorageService.cookie.remove(key);
                },

                windowWidth: $(window).width(),

                bootStrapWidth: function (width) {
                    width = parseInt(width);

                    if (width >= 1200) {
                        return 'lg';
                    } else if (width >= 992 && width < 1200) {
                        return 'md';
                    } else if (width >= 768 && width < 992) {
                        return 'sm';
                    } else if (width < 768) {
                        return 'xs';
                    }
                },


                trustAsHtml: function (value) {
                    return $sce.trustAsHtml(value);
                },

                intersectionArray: function (arr1, arr2) {
                    return _.intersection(arr1, arr2);
                },

                getAmazonS3Url: function (keyWithoutSlash) {
                    var domain = 'https://assets.africanexponent.com/';
                    return domain + keyWithoutSlash;
                },

                defaultProfilePicture: '/public/imgsmin/default_avatar/default_avatar_red_462_462.png',

                isAdmin: function (user) {
                    var arr = [77, 100, 101];
                    return user.adminLevels.length === 0 ? false : _.intersection(user.adminLevels, arr).length > 0;
                },

                assetsDomainWithSlash: function () {
                    return 'https://assets.africanexponent.com/';
                },

                goToTop: function () {
                    $location.hash('pageTop');
                    $anchorScroll();
                },

                back: function () {
                    $rootScope.back();
                },

                responseStatusHandler: function (resp) {
                    $filter('responseFilter')(resp);
                },

                showToast: function (type, msg) {
                    $rootScope.showToast(type, msg);
                },

                clearBanners: function () {
                    $rootScope.$broadcast('clearBanners');
                },

                redirectToAbout: function () {
                    $window.location.href = '/about';
                },

                redirectToLogin: function () {
                    $window.location.href = '/notLoggedIn';
                },

                reloadPage: function () {
                    $window.location.reload();
                },

                redirectToHome: function () {
                    $window.location.href = '/';
                },

                redirectToPage: function (pathWithFirstSlash) {
                    $window.location.href = getLocationHost() + pathWithFirstSlash;
                },

                redirectToPreviousPage: function () {
                    window.location.href = document.referrer;
                },

                showExecuting: function (message) {
                    var msg;
                    if (!message || typeof message !== 'string' || message.length === 0) {
                        msg = 'Performing action...';
                    } else {
                        msg = message + '...';
                    }

                    return ngDialog.open({
                        data: {
                            message: msg
                        },
                        templateUrl: 'views/dialogs/executing.html',
                        className: 'ngdialog-theme-default',
                        overlay: true,
                        showClose: false,
                        closeByEscape: false,
                        closeByDocument: false,
                        cache: true,
                        trapFocus: false,
                        preserveFocus: true
                    });
                }

            };

            $rootScope.main.getUserLocationData();

            $rootScope.back = function () {
                window.history.back();
            };

            function getLocationHost() {
                if (document.location.hostname.search("africanexponent") !== -1) {
                    return "//www.africanexponent.com";
                } else if (document.location.hostname.search("amazonaws") !== -1) {
                    return "//ec2-54-85-41-117.compute-1.amazonaws.com:3000";
                } else {
                    if ($location.port()) {
                        return 'http://localhost' + ":" + $location.port();
                    } else {
                        return 'http://localhost';
                    }
                }
            }
        }
    ]);
angular.module('app')
    .directive('resendEmailScope', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope) {

                $scope.resendConfirmationEmail = function (userUniqueCuid) {
                    var dialog = $rootScope.main.showExecuting('Sending Email');
                    resendConfirmationEmail(userUniqueCuid)
                        .success(function (resp) {
                            dialog.close();
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (err) {
                            dialog.close();
                            $rootScope.main.responseStatusHandler(err);
                        });
                };

                function resendConfirmationEmail(userUniqueCuid) {
                    return $http.post('/resendConfirmationEmail', {
                        userUniqueCuid: userUniqueCuid
                    });
                }
            }
        };
    }]);
angular.module('app')
    .filter("responseFilter", ['$q', '$log', '$window', '$rootScope', 'ngDialog', function ($q, $log, $window, $rootScope, ngDialog) {
        return function (resp) {
            function makeBanner(show, bannerClass, msg) {
                return {
                    show: show ? true : false,
                    bannerClass: bannerClass,
                    msg: msg
                };
            }

            if (resp !== null && typeof resp === 'object') {
                if (resp.redirect) {
                    if (resp.redirectPage) {
                        $window.location.href = resp.redirectPage;
                    }
                }
                if (resp.reload) {
                    $rootScope.main.reloadPage();
                }
                if (resp.notify) {
                    if (resp.type && resp.msg) {
                        $rootScope.showToast(resp.type, resp.msg);
                        //showNotificationBar(resp.type, resp.msg);
                    }
                }
                if (resp.dialog) {
                    if (resp.id) {
                        switch (resp.id) {
                            case "not-authorized":
                                not_authorized_dialog();
                                break;
                            case "sign-in":
                                sign_in_dialog(resp.msg);
                                break;
                            default:
                            //do nothing
                        }
                    }
                }
                if (resp.banner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.$broadcast('universalBanner', makeBanner(true, resp.bannerClass, resp.msg));
                    }
                }
                if (resp.signInBanner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.$broadcast('signInBanner', makeBanner(true, resp.bannerClass, resp.msg));
                    }
                }
                if (resp.registrationBanner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.$broadcast('registrationBanner', makeBanner(true, resp.bannerClass, resp.msg));
                    }
                }
                if (resp.reason) {
                    $log.warn(resp.reason);
                }
            } else {
                //do nothing
            }

            return true;

            function not_authorized_dialog() {
                ngDialog.open({
                    template: '/dialog/not-authorized.html',
                    className: 'ngdialog-theme-default',
                    overlay: true,
                    showClose: false,
                    closeByEscape: true,
                    closeByDocument: true,
                    cache: false,
                    trapFocus: true,
                    preserveFocus: true
                });
            }

            function sign_in_dialog(message) {
                ngDialog.openConfirm({
                    data: {
                        message: message
                    },
                    template: '/dialog/sign-in.html',
                    className: 'ngdialog-theme-default',
                    overlay: true,
                    showClose: false,
                    closeByEscape: false,
                    closeByDocument: false,
                    cache: true,
                    trapFocus: true,
                    preserveFocus: true
                }).then(function () {
                    $rootScope.main.redirectToPage('/notLoggedIn');
                }, function () {
                    $rootScope.main.redirectToPage('/about');
                });
            }
        };
    }]);
angular.module('app')
    .factory('globals', ['$location', '$http',
        function ($location, $http) {
            var userData = {};

            return {

                userData: function (data) {
                    if (data) {
                        userData = data;
                        return userData;
                    } else {
                        return userData;
                    }
                },

                userDataFromServer: function () {
                    return $http.get('/api/getUserData');
                },

                getLocationHost: function () {
                    if (document.location.hostname.search("africanexponent") !== -1) {
                        return "//www.africanexponent.com";
                    } else if (document.location.hostname.search("amazonaws") !== -1) {
                        return "//ec2-54-85-41-117.compute-1.amazonaws.com:3000";
                    } else {
                        if ($location.port()) {
                            return 'http://localhost' + ":" + $location.port();
                        } else {
                            return 'http://localhost';
                        }
                    }
                }
            };
        }
    ]);
angular.module('app')
    .directive('toastrDirective', ['$rootScope', 'toastr', function ($rootScope, toastr) {
        return {
            restrict: 'AE',
            link: function () {
                $rootScope.showToast = function (toastType, text) {
                    switch (toastType) {
                        case "success":
                            toastr.clear();
                            toastr.success(text);
                            break;
                        case "warning":
                            toastr.clear();
                            toastr.warning(text, 'Warning', {
                                closeButton: true,
                                tapToDismiss: true
                            });
                            break;
                        case "error":
                            toastr.clear();
                            toastr.error(text, 'Error', {
                                closeButton: true,
                                tapToDismiss: true,
                                timeOut: false
                            });
                            break;
                        default:
                            //clears current list of toasts
                            toastr.clear();
                    }
                };

                $rootScope.clearToasts = function () {
                    toastr.clear();
                };
            }
        };
    }])
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