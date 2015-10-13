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
    'ngTagsInput',
    'ngFileUpload',
    'toastr',
    'ngDialog',
    'ui.select',
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
angular.module('app')
    .directive('socialDirective', ['$rootScope', 'globals', '$http', function ($rootScope, globals, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.social = {
                    showSpinner: false,
                    isBusy: function () {
                        this.showSpinner = true;
                        $scope.main.busy();
                    },
                    done: function () {
                        this.showSpinner = false;
                        $scope.main.done();
                    },

                    deleteConnectedService: function (serviceName) {

                        $scope.social.isBusy();

                        return Promise.resolve()
                            .then(function () {
                                if (!serviceName) {
                                    throw {
                                        code: 500,
                                        msg: 'serviceName = ' + serviceName
                                    };
                                } else {
                                    return true;
                                }
                            })
                            .then(function () {
                                return $http.post('/api/deleteConnectedService', {
                                    serviceName: serviceName
                                })
                                    .then(function (resp) {
                                        resp = resp.data;
                                        $rootScope.main.responseStatusHandler(resp);
                                        return resp.theUser;
                                    })
                                    .catch(function (err) {
                                        err = err.data;
                                        $rootScope.main.responseStatusHandler(err);
                                        throw err;
                                    })
                            })
                            .then(function (updatedUser) {
                                $scope.main.userData.social = updatedUser.social;
                                return true;
                            })
                            .then(function () {
                                if (serviceName === 'facebook') {
                                    return new Promise(function (resolve, reject) {
                                        FB.getLoginStatus(function (response) {
                                            if (response.status === 'connected') {
                                                FB.logout(function (response) {
                                                    resolve(true);
                                                });
                                            } else {
                                                resolve(true);
                                            }
                                        });
                                    })
                                } else {
                                    return true;
                                }
                            })
                            .catch(function (err) {
                                console.log(err);
                                return true;
                            })
                            .then(function () {
                                $scope.social.done();
                            })

                    }
                };

                var fbOptions = {
                    credentials: {},
                    profile: {}
                };

                $scope.connectToFacebook = function () {

                    $scope.social.isBusy();

                    return Promise.resolve()
                        .then(function () {
                            return new Promise(function (resolve, reject) {
                                FB.login(function (credentials) {
                                    resolve(credentials)
                                });
                            })
                        })
                        .then(function (credentials) {
                            if (credentials.status !== 'connected') {
                                throw {
                                    code: 401
                                };
                            } else {
                                fbOptions.credentials = credentials.authResponse;
                                //add the date
                                fbOptions.credentials.dateConnected = new Date().getTime();
                                return true;
                            }
                        })
                        .then(function () {
                            //check that the permissions to the public profile are granted
                            return new Promise(function (resolve, reject) {
                                FB.api('/me/permissions', function (response) {
                                    var permissionsArray = response.data;
                                    var public_profile = false;
                                    for (var i = 0; i < permissionsArray.length; i++) {
                                        if (permissionsArray[i].permission == "public_profile") {
                                            permissionsArray[i].status === 'granted' ? public_profile = true : public_profile = false;
                                            break;
                                        }
                                    }

                                    if (!public_profile) {
                                        reject({
                                            code: 401
                                        });
                                    } else {
                                        resolve(true);
                                    }
                                });
                            })
                        })
                        .then(function () {
                            return new Promise(function (resolve, reject) {
                                FB.api('/me', function (response) {
                                    resolve(response);
                                });
                            })
                        })
                        .then(function (profile) {
                            if (profile.id) { //check that we actually have the profile
                                fbOptions.profile = profile;
                                return true;
                            } else {
                                throw {
                                    msg: 'profile = ' + profile,
                                    code: 500
                                };
                            }
                        })
                        .then(function () {
                            return $http.post('/api/updateUserFacebook', fbOptions)
                                .then(function (resp) {
                                    resp = resp.data;
                                    $rootScope.main.responseStatusHandler(resp);
                                    return resp.theUser;
                                })
                                .catch(function (err) {
                                    err = err.data;
                                    $rootScope.main.responseStatusHandler(err);
                                    throw err;
                                })
                        })
                        .then(function (updatedUser) {
                            $scope.main.userData.social = updatedUser.social;
                            return true;
                        })
                        .catch(function (err) {
                            console.log(err);
                            return true;
                        })
                        .then(function () {
                            $scope.social.done();
                        })
                }
            }
        }
    }]);
angular.module('app')
    .directive('biographyDirective', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editBiography = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.biography = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelBiography = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.biography = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.biography = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);
angular.module('app')
    .directive('emailDirective', ['$rootScope', 'globals', '$http', function ($rootScope, globals, $http) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editEmail = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.email = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelEmail = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.email = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.email = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);
angular.module('app')
    .directive('fullName', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editFullName = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.fullName = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelFullName = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.firstName = '';
                            $scope.main.lastName = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.fullName = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);
angular.module('app')
    .directive('editPasswordDirective', ['$rootScope', 'globals', '$http', function ($rootScope, globals, $http) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.updatePassword = function () {
                    Promise.resolve()
                        .then(function () {
                            return $scope.main.updateUserPassword();
                        });
                };

            }
        }
    }]);
angular.module('app')
    .directive('statusLineDirective', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editStatusLine = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.statusLine = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelStatusLine = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.statusLine = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.statusLine = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);
angular.module('app')
    .directive('usernameDirective', ['$rootScope', 'globals', '$http', function ($rootScope, globals, $http) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.editUsername = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(3000);
                        })
                        .then(function () {
                            $scope.main.mainCollapse.username = false;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                };

                $scope.cancelUsername = function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            $scope.main.username = '';
                        })
                        .then(function () {
                            $scope.main.mainCollapse.username = true;
                        })
                        .then(function () {
                            $scope.main.done();
                        });
                }

            }
        }
    }]);
angular.module('app')
    .controller('EditDetailsController', ['$filter', '$window', '$location', '$scope', '$rootScope', '$http', 'ngDialog',
        function ($filter, $window, $location, $scope, $rootScope, $http, ngDialog) {

            $scope.main = {
                mainCollapse: {
                    fullName: true,
                    email: true,
                    username: true,
                    statusLine: true,
                    biography: true
                },

                collapseAll: function () {
                    for (var t in this.mainCollapse) {
                        if (this.mainCollapse.hasOwnProperty(t)) {
                            this.mainCollapse[t] = true;
                        }
                    }
                },

                userData: {},
                userEditModel: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    username: '',
                    statusLine: '',
                    biography: ''
                },

                contentHasBeenEdited: false,

                isLoading: true, //initial loading state where everything loads
                showSpinner: false,
                showDone: false,
                isBusy: false,
                busy: function () {
                    this.showSpinner = true;
                    this.showDone = false;
                    this.isBusy = true;
                },
                done: function () {
                    var self = this;
                    self.showSpinner = false;
                    self.isBusy = false;
                    self.showDone = true;
                    Promise.delay(2000)
                        .then(function () {
                            self.showDone = false;
                        })
                },

                update: function () {
                    Promise.resolve()
                        .then(function () {
                            $scope.main.busy();
                            return Promise.delay(1000);
                        })
                        .then(function () {
                            var temp = {};
                            if ($scope.main.userEditModel.firstName.length > 0) {
                                temp.firstName = $scope.main.userEditModel.firstName;
                            }

                            if ($scope.main.userEditModel.lastName.length > 0) {
                                temp.lastName = $scope.main.userEditModel.lastName;
                            }

                            if ($scope.main.userEditModel.email.length > 0) {
                                temp.email = $scope.main.userEditModel.email;
                            }

                            if ($scope.main.userEditModel.username.length > 0) {
                                temp.username = $scope.main.userEditModel.username;
                            }

                            if ($scope.main.userEditModel.statusLine.length > 0) {
                                temp.statusLine = $scope.main.userEditModel.statusLine;
                            }

                            if ($scope.main.userEditModel.biography.length > 0) {
                                temp.biography = $scope.main.userEditModel.biography;
                            }

                            return $http.post('/api/updateUserDetails', {
                                data: temp
                            });
                        })
                        .then(function (obj) {
                            obj = obj.data;
                            $rootScope.main.responseStatusHandler(obj);
                            return $scope.main.getUserData();
                        })
                        .then(function () {
                            $scope.main.collapseAll();
                            $scope.main.done();
                        })
                        .catch(function (err) {
                            err = err.data;
                            $rootScope.main.responseStatusHandler(err);
                            $scope.main.done();
                        });
                },

                passwordEditModel: {
                    oldPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                },

                updateUserPassword: function () {
                    if (this.passwordEditModel.oldPassword && this.passwordEditModel.newPassword && this.passwordEditModel.confirmNewPassword) {
                        return Promise.resolve()
                            .then(function () {
                                $scope.main.busy();
                                return Promise.delay(1000);
                            })
                            .then(function () {
                                var temp = {
                                    oldPassword: $scope.main.passwordEditModel.oldPassword,
                                    newPassword: $scope.main.passwordEditModel.newPassword,
                                    confirmNewPassword: $scope.main.passwordEditModel.confirmNewPassword
                                };
                                return $http.post('/api/updateUserPassword', {
                                    data: temp
                                });
                            })
                            .then(function (obj) {
                                obj = obj.data;
                                $rootScope.main.responseStatusHandler(obj);
                            })
                            .then(function () {
                                $scope.main.passwordEditModel.oldPassword = '';
                                $scope.main.passwordEditModel.newPassword = '';
                                $scope.main.passwordEditModel.confirmNewPassword = '';
                                $scope.main.done();
                            })
                            .catch(function (err) {
                                err = err.data;
                                $rootScope.main.responseStatusHandler(err);
                                $scope.main.done();
                            });
                    }
                },

                getUserData: function () {
                    return Promise.resolve()
                        .then(function () {
                            return $http.get('/api/getUserData');
                        })
                        .then(function (obj) {
                            obj = obj.data;
                            if (!obj.userData) {
                                $rootScope.main.redirectToLogin();
                            } else {
                                $scope.main.userData = obj.userData;
                                return Promise.delay(1000)
                                    .then(function () {
                                        $scope.main.isLoading = false;
                                    });
                            }
                        })
                }
            };

            $scope.main.getUserData()
                .catch(function (err) {
                    err = err.data;
                    $rootScope.main.responseStatusHandler(err);
                    $scope.main.done();
                });

            //watch if user has edited any thing and mark it as edited
            $scope.$watch(function () {
                return $scope.main.mainCollapse;
            }, function (newVal, oldVal) {
                var isEdited = false;
                if (newVal) {
                    for (var p in newVal) {
                        if (newVal.hasOwnProperty(p)) {
                            if (newVal[p] === false) {
                                isEdited = true;
                            }
                        }
                    }
                }

                $scope.main.contentHasBeenEdited = isEdited;

            }, true);
        }
    ]);
angular.module('app')
    .directive('profilePictureUploader', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $scope.selectedFileType = {
                    type: 'image'
                };

                $scope.isUploading = false;
                $scope.uploading = {
                    show: false,
                    percent: 0,
                    status: 'Uploading...'
                };


                function incrementUploadingPercent() {
                    if ($scope.uploading.percent < 100) {
                        $scope.uploading.percent++;
                    }
                }

                var progressIntervalPromise;

                $scope.$watch(function () {
                    return $scope.uploading.percent;
                }, function (newVal, oldVal) {
                    /*user upload progress goes until 80%*/
                    if (newVal == 80) {
                        $scope.uploading.status = 'Processing...';
                        progressIntervalPromise = $interval(incrementUploadingPercent, 1000);
                    }
                });

                $scope.showUploading = function () {
                    $scope.isUploading = true;
                    $scope.uploading.percent = 0;
                    $scope.uploading.status = 'Uploading';
                    $scope.uploading.show = true;
                };

                $scope.hideProgressBars = function () {
                    $scope.isUploading = false;
                    $scope.uploading.show = false;
                    $scope.uploading.status = 'Uploading';

                    /*stop the timeout*/
                    if (progressIntervalPromise) {
                        $interval.cancel(progressIntervalPromise)
                    }
                };

                $scope.upload = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        $scope.showUploading();
                        if ($scope.selectedFileType.type === 'image') {
                            uploadProfilePicture(fields, file);
                        }
                    }
                };

                function uploadProfilePicture(fields, file) {
                    uploadImageToServer(fields, file)
                        .progress(function (evt) {
                            $scope.uploading.percent = parseInt(80.0 * evt.loaded / evt.total);
                        })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $scope.hideProgressBars();
                            //refresh page to reflect updates
                            $rootScope.main.reloadPage();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                function uploadImageToServer(fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadProfilePicture',
                        fields: fields,
                        file: file
                    });
                }
            }
        }
    }]);