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
    .controller('UserManagerController', ['$q', '$scope', '$rootScope', 'UserService', 'globals',
        function ($q, $scope, $rootScope, UserService) {

            $scope.usersCount = UserService.getUsersCount();

            function getUsersCount() {
                UserService.getUsersCountFromServer()
                    .success(function (resp) {
                        $scope.usersCount = UserService.updateUsersCount(resp.usersCount);
                        $rootScope.main.responseStatusHandler(resp);
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                    });
            }

            getUsersCount();
        }
    ]);
angular.module('app')
    .filter("getSlugUrl", [function () {
        return function (post) {
            function convertToSlug(Text) {
                return Text
                    .toLowerCase()
                    .replace(/[^\w ]+/g, '')
                    .replace(/ +/g, '-');
            }

            var text = convertToSlug(post.postShortHeading);
            return text + '-' + post.postIndex;
        };
    }]);
angular.module('app')
    .filter("validatePostHeading", ['$rootScope', function ($rootScope) {
        return function (postHeading, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            if (postHeading) {
                if (postHeading.length == 0) {
                    errors++;
                    broadcastShowToast('warning', 'The heading is required');
                }
                if (errors == 0) {
                    if (postHeading.length < 10) {
                        broadcastShowToast('warning', 'The minimum required length of the heading is 10 characters');
                        errors++;
                    }
                }
            } else {
                errors++;
                broadcastShowToast('warning', 'The heading is required');
            }
            return errors == 0;
        }
    }])
    .filter("postHeadingMessages", [function () {
        return function (postHeading) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            if (postHeading) {
                var postHeadingText = $("<div>" + postHeading + "</div>").text();

                if (postHeadingText.length == 0) {
                    addMessage('This is a required field');
                }
                if (postHeadingText.length > 0 && postHeadingText.length < 10) {
                    addMessage('Minimum length required is 10 characters');
                }
            } else {
                addMessage('This is a required field');
            }
            return messages;

        }
    }])
    .filter("validatePostShortHeading", ['$rootScope', function ($rootScope) {
        return function (postShortHeading, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            if (postShortHeading) {
                if (postShortHeading.length == 0) {
                    errors++;
                    broadcastShowToast('warning', 'The short heading is required');
                }
                if (errors == 0) {
                    if (postShortHeading.length < 10) {
                        broadcastShowToast('warning', 'The minimum required length of the short heading is 10 characters');
                        errors++;
                    }
                }
                if (errors == 0) {
                    if (postShortHeading.length > 60) {
                        broadcastShowToast('warning', 'The maximum allowed length of the short heading is 60 characters');
                        errors++;
                    }
                }
            } else {
                errors++;
                broadcastShowToast('warning', 'The short heading is required');
            }
            return errors == 0;
        }
    }])
    .filter("postShortHeadingMessages", [function () {
        return function (postShortHeading) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            if (postShortHeading) {
                var postShortHeadingText = $("<div>" + postShortHeading + "</div>").text();

                if (postShortHeadingText.length == 0) {
                    addMessage('The is a required field');
                }
                if (postShortHeadingText.length > 0 && postShortHeadingText.length < 10) {
                    addMessage('Minimum length required is 10 characters');
                }
                if (postShortHeadingText.length > 60) {
                    addMessage('This heading cannot exceed 60 characters');
                }
            } else {
                addMessage('This is a required field');
            }
            return messages;

        }
    }])
    .filter("validatePostContent", ['$rootScope', function ($rootScope) {
        return function (postContent, broadcast) {
            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            if (postContent) {
                var postContentText = $("<div>" + postContent + "</div>").text();
                if (postContentText.length == 0) {
                    broadcastShowToast('warning', 'Please add some text to the post first');
                }
                return postContentText.length > 0;
            } else {
                broadcastShowToast('warning', 'Please add some text to the post first');
                return false;
            }
        }
    }])
    .filter("postContentMessages", [function () {
        return function (postContent) {
            if (postContent) {
                var postContentText = $("<div>" + postContent + "</div>").text();
                if (postContentText.length == 0) {
                    return "This is a required field"
                } else {
                    return "";
                }
            } else {
                return "This is a required field"
            }
        }
    }])
    .filter("validatePostSummary", ['$rootScope', function ($rootScope) {
        return function (postSummary, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            if (postSummary) {
                var postSummaryText = $("<div>" + postSummary + "</div>").text();

                if (postSummaryText.length == 0) {
                    errors++;
                    broadcastShowToast('warning', 'The post summary cannot be empty');
                }
                if (errors == 0) {
                    if (postSummaryText.length > 250) {
                        errors++;
                        broadcastShowToast('warning', 'The post summary cannot exceed 250 characters');
                    }
                }
            } else {
                errors++;
                broadcastShowToast('warning', 'The post summary cannot be empty');
            }
            return errors == 0;
        }
    }])
    .filter("postSummaryMessages", [function () {
        return function (postSummary) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            if (postSummary) {
                var postSummaryText = $("<div>" + postSummary + "</div>").text();

                if (postSummaryText.length == 0) {
                    addMessage('The post summary cannot be empty');
                }
                if (postSummaryText.length > 250) {
                    addMessage('The post summary cannot exceed 250 characters');
                }
            } else {
                addMessage('The post summary cannot be empty');
            }
            return messages;

        }
    }])
    .filter("validatePostTags", ['$rootScope', function ($rootScope) {
        return function (postTags, broadcast) {
            var errors = 0;

            function broadcastShowToast(type, text) {
                if (broadcast) {
                    $rootScope.main.showToast(type, text);
                }
            }

            var numberOfTags = 0;

            if (postTags) {
                postTags.forEach(function (tag) {
                    numberOfTags++;
                    if (tag && tag.text) {
                        if (errors == 0) {
                            if (tag.text.length < 3) {
                                errors++;
                                broadcastShowToast('warning', 'Minimum required length for each tag is 3 characters');
                            }
                        }

                        if (errors == 0) {
                            if (tag.text.length > 30) {
                                errors++;
                                broadcastShowToast('warning', 'Maximum allowed length for each tag is 30 characters');
                            }
                        }
                    }
                });

                if (errors == 0) {
                    if (numberOfTags < 1) {
                        errors++;
                        broadcastShowToast('warning', 'Every post should have at least one tag');
                    }
                    if (numberOfTags > 5) {
                        errors++;
                        broadcastShowToast('warning', 'Only a maximum of 5 tags are allowed per post');
                    }
                }
            } else {
                errors++;
                broadcastShowToast('warning', 'Every post should have at least one tag');
            }

            return errors == 0;
        }
    }])
    .filter("postTagsMessages", [function () {
        return function (postTags) {
            var messages = "";

            function addMessage(newMessage) {
                if (messages) {
                    messages = messages + ": " + newMessage;
                } else {
                    messages = messages + newMessage;
                }
            }

            var numberOfTags = 0;

            if (postTags) {
                postTags.forEach(function (tag) {
                    numberOfTags++;
                    if (tag && tag.text) {
                        if (tag.text.length < 3) {
                            addMessage('Minimum required length for each tag is 3 characters');
                        }

                        if (tag.text.length > 30) {
                            addMessage('Maximum allowed length for each tag is 30 characters');
                        }
                    }
                });

                if (numberOfTags > 5) {
                    addMessage('Only a maximum of 5 tags are allowed per post');
                }
            }

            return messages;
        }
    }]);
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
angular.module('app')
    .factory('PostService', ['$filter', '$http',
        function ($filter, $http) {

            return {

                getCurrentEditPostModelFromServer: function (postIndex) {
                    return $http.post('/api/getPost', {
                        postIndex: postIndex
                    });
                },

                submitNewPost: function (newPost) {
                    return $http.post('/api/newPost', {
                        newPost: newPost
                    });
                },

                submitPostUpdate: function (post) {
                    return $http.post('/api/updatePost', {
                        postUpdate: post
                    });
                },

                trashPost: function (postUniqueCuid) {
                    return $http.post('/api/trashPost', {
                        postUniqueCuid: postUniqueCuid
                    });
                },

                unTrashPost: function (postUniqueCuid) {
                    return $http.post('/api/unTrashPost');
                }
            };
        }
    ]);
angular.module('app')
    .factory('UserService', ['$filter', '$http',
        function ($filter, $http) {

            var usersCount = {};
            var allUsers = [];
            var adminUsers = [];
            var usersNotApproved = [];
            var bannedUsers = [];

            return {

                getUsersCount: function () {
                    return usersCount;
                },

                getUsersCountFromServer: function () {
                    return $http.post('/api/getUsersCount', {})
                },

                updateUsersCount: function (newUsersCount) {
                    usersCount = newUsersCount;
                    return usersCount;
                },

                getAllUsers: function () {
                    return allUsers;
                },

                getAllUsersFromServer: function () {
                    return $http.post('/api/getAllUsers', {})
                },

                updateAllUsers: function (usersArray) {
                    allUsers = usersArray;
                    return allUsers;
                },

                getAdminUsers: function () {
                    return adminUsers;
                },

                getAdminUsersFromServer: function () {
                    return $http.post('/api/getAdminUsers', {})
                },

                updateAdminUsers: function (usersArray) {
                    adminUsers = usersArray;
                    return adminUsers;
                },

                getUsersNotApproved: function () {
                    return usersNotApproved;
                },

                getUsersNotApprovedFromServer: function () {
                    return $http.post('/api/getUsersNotApproved', {})
                },

                updateUsersNotApproved: function (usersArray) {
                    usersNotApproved = usersArray;
                    return usersNotApproved;
                },

                getBannedUsers: function () {
                    return bannedUsers;
                },

                getBannedUsersFromServer: function () {
                    return $http.post('/api/getBannedUsers', {})
                },

                updateBannedUsers: function (usersArray) {
                    bannedUsers = usersArray;
                    return bannedUsers;
                },

                addAdminPrivileges: function (userUniqueCuid) {
                    return $http.post('/api/addAdminPrivileges', {
                        userUniqueCuid: userUniqueCuid
                    })
                },

                removeAdminPrivileges: function (userUniqueCuid) {
                    return $http.post('/api/removeAdminPrivileges', {
                        userUniqueCuid: userUniqueCuid
                    })
                },

                approveUser: function (userUniqueCuid) {
                    return $http.post('/api/approveUser', {
                        userUniqueCuid: userUniqueCuid
                    })
                },

                banUser: function (userUniqueCuid) {
                    return $http.post('/api/banUser', {
                        userUniqueCuid: userUniqueCuid
                    })
                },

                unBanUser: function (userUniqueCuid) {
                    return $http.post('/api/unBanUser', {
                        userUniqueCuid: userUniqueCuid
                    })
                }
            };
        }
    ]);
angular.module('app')
    .directive('ckEditor', function () {
        return {
            require: '?ngModel',
            link: function (scope, elm, attr, ngModel) {
                var ck = CKEDITOR.replace(elm[0]);

                if (!ngModel) return;

                ck.on('pasteState', function () {
                    scope.$apply(function () {
                        ngModel.$setViewValue(ck.getData());
                    });
                });

                ngModel.$render = function (value) {
                    ck.setData(ngModel.$viewValue);
                };
            }
        };
    });
angular.module('app')
    .directive('adminUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'admin_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.adminUsersModel = {
                    filterString: ""
                };
                $scope.adminUsers = UserService.getAdminUsers();

                function getAdminUsers() {
                    UserService.getAdminUsersFromServer()
                        .success(function (resp) {
                            $scope.adminUsers = UserService.updateAdminUsers(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                }
                getAdminUsers();

                $rootScope.$on('userChanges', function () {
                    getAdminUsers();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);
angular.module('app')
    .directive('allUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'all_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.allUsersModel = {
                    filterString: ""
                };

                $scope.allUsers = UserService.getAllUsers();

                function getAllUsers() {
                    UserService.getAllUsersFromServer()
                        .success(function (resp) {
                            $scope.allUsers = UserService.updateAllUsers(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                }
                getAllUsers();

                $rootScope.$on('userChanges', function () {
                    getAllUsers();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);
angular.module('app')
    .directive('bannedUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'banned_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //the model to be used when searching
                $scope.bannedUsersModel = {
                    filterString: ""
                };

                $scope.bannedUsers = UserService.getBannedUsers();

                function getBannedUsers() {
                    UserService.getBannedUsersFromServer()
                        .success(function (resp) {
                            $scope.bannedUsers = UserService.updateBannedUsers(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                }
                getBannedUsers();

                $rootScope.$on('userChanges', function () {
                    getBannedUsers();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);
angular.module('app')
    .directive('unApprovedUsers', ['$q', '$log', '$rootScope', 'UserService', 'globals', function ($q, $log, $rootScope, UserService, globals) {
        return {
            templateUrl: 'unApproved_users.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.usersNotApprovedModel = {
                    filterString: ""
                };
                $scope.usersNotApproved = UserService.getUsersNotApproved();

                function getUsersNotApproved() {
                    UserService.getUsersNotApprovedFromServer()
                        .success(function (resp) {
                            $scope.usersNotApproved = UserService.updateUsersNotApproved(resp.usersArray);
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                }
                getUsersNotApproved();

                $rootScope.$on('userChanges', function () {
                    getUsersNotApproved();
                });

                $rootScope.$on('reconnect', function () {
                });
            }
        }
    }]);
angular.module('app')
    .directive('userDisplay', ['$rootScope', 'UserService', '$http', function ($rootScope, UserService, $http) {
        return {
            templateUrl: 'user_display.html',
            restrict: 'AE',
            scope: {
                user: '='
            },
            link: function ($scope, $element, $attrs) {
                //$scope.user included in scope

                $scope.isCollapsed = true;

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

                    function resendConfirmationEmail(userUniqueCuid) {
                        return $http.post('/resendConfirmationEmail', {
                            userUniqueCuid: userUniqueCuid
                        });
                    }
                };

                //user manipulation functions
                $scope.addAdminPrivileges = function (userUniqueCuid) {
                    UserService.addAdminPrivileges(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
                $scope.removeAdminPrivileges = function (userUniqueCuid) {
                    UserService.removeAdminPrivileges(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
                $scope.approveUser = function (userUniqueCuid) {
                    UserService.approveUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
                $scope.banUser = function (userUniqueCuid) {
                    UserService.banUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
                $scope.unBanUser = function (userUniqueCuid) {
                    UserService.unBanUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };
            }
        }
    }]);
angular.module('app')
    .controller('userPermissionsController', ['$rootScope', '$scope', 'ngTableParams', '$http', function ($rootScope, $scope, ngTableParams, $http) {

        $scope.main = {
            users: [],
            userData: {},
            loadingUser: false,
            searchModel: {
                query: ''
            },

            getUserData: function () {
                return Promise.resolve()
                    .then(function () {
                        $scope.main.loadingUser = true;
                        return $http.get('/api/getUserData');
                    })
                    .then(function (obj) {
                        obj = obj.data;
                        if (!obj.userData) {
                            $rootScope.main.redirectToLogin();
                        } else {
                            $scope.main.userData = obj.userData;
                        }
                        $scope.main.loadingUser = false;
                    })
            },

            getUserWithUniqueCuid: function (uniqueCuid) {
                $scope.main.loadingUser = true;
                return $http.post('/api/getUserWithUniqueCuid', {
                    uniqueCuid: uniqueCuid
                })
                    .then(function (resp) {
                        resp = resp.data;
                        $rootScope.main.responseStatusHandler(resp);
                        $scope.main.loadingUser = false;
                        if (!resp.userData) {
                            return {};
                        } else {
                            return resp.userData;
                        }
                    })
                    .catch(function (err) {
                        err = err.data;
                        $scope.main.loadingUser = false;
                        throw err;
                    })
            },

            permissions: {},

            getAllPermissions: function () {
                return $http.post('/api/getAllUserPermissions');
            },

            //this is na object whose keys are permissions id's, and
            //value as of now are isChecked
            userPermissionsModel: {},

            prepareUserPermissionsModel: function (user) {
                var userPermissions = user.adminLevels;
                return Promise.resolve()
                    .then(function () {
                        for (var key in $scope.main.permissions) {
                            if ($scope.main.permissions.hasOwnProperty(key)) {
                                if (userPermissions.indexOf(parseInt(key)) > -1) {
                                    $scope.main.userPermissionsModel[key] = {};
                                    $scope.main.userPermissionsModel[key].isChecked = true;
                                } else {
                                    $scope.main.userPermissionsModel[key] = {};
                                    $scope.main.userPermissionsModel[key].isChecked = false;
                                }
                            }
                        }

                        return user;
                    })
            },

            userToDisplay: {},

            changeUserToDisplay: function (uniqueCuid) {
                return Promise.resolve()
                    .then(function () {
                        return $scope.main.getUserData();
                    })
                    .then(function () {
                        return $scope.main.getUserWithUniqueCuid(uniqueCuid);
                    })
                    .then(function (user) {
                        return $scope.main.prepareUserPermissionsModel(user);
                    })
                    .then(function (user) {
                        $scope.main.userToDisplay = user;
                    })
                    .catch(function (err) {
                        $rootScope.main.responseStatusHandler(err);
                        console.log(err);
                    })
            }
        };

        $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 10           // count per page
        }, {
            total: 0,
            counts: [10, 20, 40, 80],

            getData: function ($defer, params) {

                getUsers({
                    query: $scope.main.searchModel.query,
                    requestedPage: params.page(),
                    quantity: params.count()
                })
                    .then(function (data) {
                        if (data) {
                            var resultObj = data.resultObj;
                            params.total(resultObj.totalResults);
                            params.page(resultObj.page);
                            $scope.main.users = resultObj.users;
                            $defer.resolve($scope.main.users);
                        } else {
                            $scope.main.users = [];
                            params.page(1); //set the page back to one
                            $defer.resolve($scope.main.users);
                        }
                    });

            }
        });

        function getUsers(options) {

            return Promise.resolve()
                .then(function () {
                    return $scope.main.getAllPermissions()
                        .success(function (data) {
                            $rootScope.main.responseStatusHandler(data);
                            $scope.main.permissions = data.permissions;
                        })
                        .error(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                            throw {
                                code: 600
                            }
                        });
                })
                .then(function () {
                    if (!options.query) {
                        options.query = 'all'; //return all users
                    }

                    if (!options.requestedPage) {
                        options.requestedPage = 1;
                    }

                    if (!options.quantity) {
                        options.quantity = 10
                    }
                    return $http.post('/api/searchUsers', {
                        query: options.query,
                        requestedPage: options.requestedPage,
                        quantity: options.quantity
                    })
                        .then(function (data) {
                            data = data.data;
                            $rootScope.main.responseStatusHandler(data);
                            return data;
                        })
                        .catch(function (err) {
                            err = err.data;
                            console.log(err);
                            $rootScope.main.responseStatusHandler(err);
                            return null;
                        })

                })
                .catch(function (err) {
                    return null;
                })
        }

    }])

    .directive('userDirective', ['$rootScope', '$http', function ($rootScope, $http) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {


                $scope.updateUserPermissions = function (userUniqueCuid, userPermissionsModel) {
                    $scope.main.loadingUser = true; //this will ultimately be changed by changeUserToDisplay -- getUserData

                    return Promise.resolve()
                        .then(function () {
                            return new Promise(function (resolve, reject) {
                                if (userPermissionsModel) {
                                    var permissionsArray = [];

                                    for (var key in userPermissionsModel) {
                                        if (userPermissionsModel.hasOwnProperty(key)) {
                                            if (userPermissionsModel[key].isChecked) {
                                                permissionsArray.push(parseInt(key));
                                            }
                                        }
                                    }

                                    resolve(permissionsArray);

                                } else {
                                    reject({
                                        code: 600,
                                        err: 'userPermissionsModel = ' + userPermissionsModel
                                    });
                                }
                            })
                        })
                        .then(function (newPermissionsArray) {
                            return $http.post('/api/updateUserPermissions', {
                                userUniqueCuid: userUniqueCuid,
                                newPermissionsArray: newPermissionsArray
                            })
                                .then(function (resp) {
                                    resp = resp.data;
                                    return resp;
                                })
                                .catch(function (err) {
                                    err = err.data;
                                    throw err
                                })
                        })
                        .then(function (resp) {
                            $rootScope.main.responseStatusHandler(resp);
                            return $scope.main.changeUserToDisplay(userUniqueCuid);
                        })
                        .catch(function (err) {
                            $rootScope.main.responseStatusHandler(err);
                            console.log(err);
                        })
                };

                $scope.resetPermissionChanges = function (userUniqueCuid) {
                    //this will do everything from refreshing the user to refreshing their permissions
                    return $scope.main.changeUserToDisplay(userUniqueCuid);
                }

            }
        }
    }])

    .directive('userActions', ['$rootScope', '$http', 'UserService', 'ngDialog', function ($rootScope, $http, UserService, ngDialog) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {


                $scope.approveUser = function (userUniqueCuid) {
                    UserService.approveUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                };


                $scope.banUser = function (userUniqueCuid) {
                    UserService.banUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                };


                $scope.unBanUser = function (userUniqueCuid) {
                    UserService.unBanUser(userUniqueCuid)
                        .success(function (resp) {
                            $rootScope.$broadcast('userChanges');
                            $rootScope.main.responseStatusHandler(resp);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.main.changeUserToDisplay(userUniqueCuid)
                        })
                };

                $scope.deleteUser = function (userUniqueCuid) {
                    return Promise.resolve()
                        .then(function () {
                            return ngDialog.openConfirm({
                                template: '/views/dialogs/confirm-delete-user.html',
                                className: 'ngdialog-theme-default',
                                overlay: true,
                                showClose: false,
                                closeByEscape: false,
                                closeByDocument: false,
                                cache: true,
                                trapFocus: true,
                                preserveFocus: true
                            })
                        })
                        .catch(function () {
                            $scope.main.showToast('success', 'Deletion cancelled');
                            throw {
                                code: 600
                            }
                        })
                        .then(function () {
                            return $http.post('/api/deleteUser', {
                                userUniqueCuid: userUniqueCuid
                            })
                                .catch(function (err) {
                                    err = err.data;
                                    $rootScope.main.responseStatusHandler(err);
                                    throw err;
                                })
                                .then(function (resp) {
                                    resp = resp.data;
                                    $rootScope.main.responseStatusHandler(resp);
                                    return resp;
                                })
                        })
                        .then(function () {
                            //reload this page
                            //sometimes the user may have deleted themselves so you want to counter that
                            $rootScope.main.reloadPage();
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                };
            }
        }
    }]);
angular.module('app')
    .directive('usersCount', ['$q', '$log', '$rootScope', 'globals', function ($q, $log, $rootScope, globals) {
        return {
            templateUrl: 'user_statistics.html',
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {
                $rootScope.$on('userChanges', function () {
                });
            }
        }
    }]);
angular.module('app')
    .directive('changePostCategoryScope', ['$rootScope', '$http', 'ngDialog', 'ngTableParams', function ($rootScope, $http, ngDialog, ngTableParams) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                //category details is field by ui select
                $scope.categoryModel = {
                    categoryDetails: {},
                    categoryPosts: [],
                    postsToChange: []
                };

                $scope.categoryPostsTableParams = new ngTableParams({
                    page: 1,            // show first page
                    count: 10           // count per page
                }, {
                    total: 0,
                    counts: [10, 20, 40, 80],

                    getData: function ($defer, params) {

                        getCategoryPosts({
                            postCategoryUniqueCuid: $scope.categoryModel.categoryDetails.postCategoryUniqueCuid,
                            requestedPage: params.page(),
                            quantity: params.count()
                        })
                            .then(function (resp) {
                                if (resp) {
                                    var resObj = resp.resObj;
                                    params.total(resObj.totalResults);
                                    params.page(resObj.page);
                                    $scope.categoryModel.categoryPosts = resObj.posts;
                                    $defer.resolve($scope.categoryModel.categoryPosts);
                                } else {
                                    $scope.categoryModel.categoryPosts = [];
                                    params.page(1); //set the page back to one
                                    $defer.resolve($scope.categoryModel.categoryPosts);
                                }
                            });

                    }
                });

                function getCategoryPosts(options) {

                    return Promise.resolve()
                        .then(function () {

                            if (!options.postCategoryUniqueCuid) { //only do this if the postCategoryUniqueCuid is defined
                                options.postCategoryUniqueCuid = 'abc';
                            }

                            if (!options.requestedPage) {
                                options.requestedPage = 1;
                            }

                            if (!options.quantity) {
                                options.quantity = 10
                            }

                            return $http.post('/api/getPostsInCategory', {
                                postCategoryUniqueCuid: options.postCategoryUniqueCuid,
                                requestedPage: options.requestedPage,
                                quantity: options.quantity
                            })
                                .then(function (resp) {
                                    resp = resp.data;
                                    $rootScope.main.responseStatusHandler(resp);
                                    return resp;
                                })
                                .catch(function (err) {
                                    err = err.data;
                                    console.log(err);
                                    $rootScope.main.responseStatusHandler(err);
                                    return null;
                                })

                        })
                        .then(function (resp) {
                            return resp;
                        })
                        .catch(function (err) {
                            console.log(err);
                            $rootScope.showToast('warning', err.msg || 'An error occurred, Please try again');
                            return null;
                        })
                }

                $scope.loadUncategorizedPosts = function () {
                    var dialog = $scope.main.showExecuting('Loading');
                    $http.post('/api/getPostsWithNoCategory')
                        .success(function (resp) {
                            dialog.close();
                            $rootScope.main.responseStatusHandler(resp);
                            $scope.categoryModel.categoryPosts = resp.postsArray;
                            $scope.categoryModel.categoryDetails = {};
                        })
                        .error(function (errResponse) {
                            dialog.close();

                            $rootScope.main.responseStatusHandler(errResponse);
                        })
                };

                $scope.selectAll = function () {
                    $scope.categoryModel.categoryPosts.forEach(function (post, index) {
                        post.isChecked = true;
                    });
                };

                $scope.unselectAll = function () {
                    $scope.categoryModel.categoryPosts.forEach(function (post, index) {
                        post.isChecked = false;
                    });
                };

                $scope.moveSelected = function () {
                    $scope.categoryModel.categoryPosts.forEach(function (post, index) {
                        if (post.isChecked) {
                            $scope.categoryModel.postsToChange.push(post.postUniqueCuid);
                        }
                    });

                    if ($scope.categoryModel.postsToChange.length > 0) {
                        ngDialog.openConfirm({
                            data: {
                                allCategories: $scope.allPostCategories.allPostCategoriesData
                            },
                            template: 'move_category_select_destination',
                            className: 'ngdialog-theme-default',
                            overlay: true,
                            showClose: true,
                            closeByEscape: true,
                            closeByDocument: true,
                            cache: true,
                            trapFocus: true,
                            preserveFocus: true
                        }).then(function (postCategoryUniqueCuid) {
                            continueMoving(postCategoryUniqueCuid);
                        }, function () {
                            $scope.main.showToast('success', 'Move cancelled');
                        });

                        function continueMoving(postCategoryUniqueCuid) {
                            var dialog = $scope.main.showExecuting('Saving');
                            return $http.post('/api/multiChangePostCategory', {
                                postUniqueCuidArray: $scope.categoryModel.postsToChange,
                                postCategoryUniqueCuid: postCategoryUniqueCuid
                            })
                                .success(function (resp) {
                                    dialog.close();
                                    $rootScope.main.responseStatusHandler(resp);

                                    //empty the posts to change!
                                    $scope.categoryModel.postsToChange = [];

                                    //function from post category controller, it will update and broadcast an event on success
                                    $scope.getAllPostCategories();
                                })
                                .error(function (errResponse) {
                                    dialog.close();
                                    $rootScope.main.responseStatusHandler(errResponse);
                                });
                        }
                    } else {
                        $scope.main.showToast('warning', 'Please select posts to move')
                    }
                }
            }
        }
    }]);
angular.module('app')
    .directive('postCategoryActionsScope', ['$q', '$log', '$rootScope', '$http', 'globals', 'ngDialog', function ($q, $log, $rootScope, $http, globals, ngDialog) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                $scope.categoryNameModel = {
                    name: ""
                };

                $scope.addPostCategory = function () {
                    if ($scope.categoryNameModel.name.length > 0) {
                        var dialog = $scope.main.showExecuting('Adding');
                        $http.post('/api/newPostCategory', $scope.categoryNameModel)
                            .success(function (resp) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.categoryNameModel.name = "";
                                //function from post category controller, it will update and broadcast an event on success
                                $scope.getAllPostCategories();
                            })
                            .error(function (errResponse) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    } else {
                        $rootScope.main.showToast('warning', 'Please enter the category name');
                    }
                };

                $scope.editPostCategoryName = function (postCategoryUniqueCuid, postCategoryName) {
                    ngDialog.openConfirm({
                        data: {
                            postCategoryName: postCategoryName
                        },
                        template: 'edit_post_category_name',
                        className: 'ngdialog-theme-default',
                        overlay: true,
                        showClose: true,
                        closeByEscape: true,
                        closeByDocument: true,
                        cache: true,
                        trapFocus: true,
                        preserveFocus: true
                    }).then(function (name) {
                        if (name && name.length > 0) {
                            continueEditing(name);
                        } else {
                            $scope.main.showToast('warning', 'Please enter a name');
                        }
                    }, function () {
                        $scope.main.showToast('success', 'Edit cancelled');
                    });
                    function continueEditing(name) {
                        var dialog = $scope.main.showExecuting('Saving');
                        $http.post('/api/editPostCategoryName', {
                            updatedPostCategoryName: name,
                            postCategoryUniqueCuid: postCategoryUniqueCuid
                        })
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                dialog.close();
                                //function from post category controller, it will update and broadcast an event on success
                                $scope.getAllPostCategories();
                            })
                            .error(function (errResponse) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(errResponse);
                            });
                    }
                };
                $scope.deletePostCategory = function (postCategoryUniqueCuid, postCategoryName) {
                    ngDialog.openConfirm({
                        data: {
                            postCategoryName: postCategoryName
                        },
                        template: 'confirm_delete_post_category',
                        className: 'ngdialog-theme-default',
                        overlay: true,
                        showClose: true,
                        closeByEscape: true,
                        closeByDocument: true,
                        cache: true,
                        trapFocus: true,
                        preserveFocus: true
                    }).then(function () {
                        continueDeleting();
                    }, function () {
                        $scope.main.showToast('success', 'Deletion cancelled')
                    });
                    function continueDeleting() {
                        var dialog = $scope.main.showExecuting('Deleting');
                        $http.post('/api/deletePostCategory', {
                            postCategoryUniqueCuid: postCategoryUniqueCuid
                        })
                            .success(function (resp) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.categoryNameModel.name = "";
                                //function from post category controller, it will update and broadcast an event on success
                                $scope.getAllPostCategories();
                            })
                            .error(function (errResponse) {
                                dialog.close();
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    }
                };
            }
        }
    }]);
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
angular.module('app')
    .directive('editPostDirectiveScope', ['$filter', '$rootScope', 'PostService', 'globals', '$http', '$interval', 'ngDialog', function ($filter, $rootScope, PostService, globals, $http, $interval, ngDialog) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                var thisUser = {};

                /*get userData from the server again. This makes sure that the userData is available
                 * why? sometimes the controller loads faster than the initial requests*/
                globals.userDataFromServer()
                    .success(function (resp) {
                        $rootScope.main.responseStatusHandler(resp);
                        if (!resp.userData) {
                            $rootScope.main.redirectToLogin();
                        } else {
                            thisUser = resp.userData;
                            continueRendering();
                        }
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                    });

                function continueRendering() {

                    //postType cannot be changed here

                    /*NOTE: this postModel is overridden by the data from the server so the extra info must
                     * be added back again. This is done by the addExtraInfoToModel function below*/
                    $scope.postModel = {
                        allPostCategories: [],
                        postUniqueCuid: '',
                        postCategoryUniqueCuid: "",
                        postHeading: "",
                        postContent: "",
                        postSummary: "",
                        postTags: [],
                        postUploads: [],
                        postShortHeading: '',
                        postHeaderImageKey: '',
                        postType: 'normal',
                        authorUniqueCuid: thisUser.uniqueCuid,
                        writers: [],
                        step: 1

                    };
                    

                    function addExtraInfoToModel() {
                        $scope.postModel.allPostCategories = [];
                        $scope.postModel.writers = [];
                        //$scope.postModel.authorName = ""; -- is available in the post
                        //$scope.postModel.authorUniqueCuid = thisUser.uniqueCuid; --is available on post
                    }

                    function getFullEditPostModel() {
                        PostService.getCurrentEditPostModelFromServer($scope.postIndex)
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                if (Object.keys(resp.thePost).length > 0) {
                                    $scope.postModel = resp.thePost;
                                    $scope.postModel.step = 1;
                                    /*add back the extra info*/
                                    /*before every other update call*/
                                    addExtraInfoToModel();
                                    $scope.postModel.authorName = resp.thePost.authorName;
                                    $scope.getAllPostCategories();
                                    $scope.getAllWriters();
                                } else {
                                    //empty the post
                                    $scope.postModel.step = 1;
                                    /*add back the extra info*/
                                    addExtraInfoToModel();
                                    $scope.getAllPostCategories();
                                    $scope.getAllWriters();
                                }
                            })
                            .error(function (errResponse) {
                                /*add back the extra info*/
                                addExtraInfoToModel();
                                $rootScope.main.responseStatusHandler(errResponse);
                            });
                    }

                    getFullEditPostModel();

                    $scope.getAllPostCategories = function () {
                        $http.post('/api/getPostCategories')
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.postModel.allPostCategories = resp.postCategoriesArray;
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    };
                    $scope.getAllWriters = function () {
                        $http.post('/api/getWriters')
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.postModel.writers = resp.usersArray;
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    };
                    $scope.previousStep = function () {
                        $scope.postModel.step--;
                        $rootScope.main.goToTop();
                    };

                    $scope.incrementStep = function () {
                        $scope.postModel.step++;
                        $rootScope.main.goToTop();
                    };


                    $scope.nextStep = function (currentStep) {
                        //step 1 involves choosing the post category
                        if (parseInt(currentStep) == 1) {
                            if ($scope.postModel.postCategoryUniqueCuid.length == 0) {
                                $rootScope.main.showToast('warning', 'Please select a category');
                            } else if ($scope.postModel.postType.length == 0) {
                                $rootScope.main.showToast('warning', 'Please select the post type');
                            } else {
                                $scope.incrementStep();
                            }
                        }

                        //step 2 involves writing the post itself
                        if (parseInt(currentStep) == 2) {
                            if ($scope.validateMainPostForm(true)) {
                                $scope.incrementStep();
                            }
                        }

                        //step 2 involves finalizing the post
                        if (parseInt(currentStep) == 3) {
                            if ($scope.validateFinalizePostForm(true)) {
                                $scope.incrementStep();
                            }
                        }
                    };


                    //broadcast here helps distinguish from the inform checking and the checking on submit, which requires notifications
                    //broadcast takes a boolean value
                    $scope.validateMainPostForm = function (notify) {
                        var errors = 0;
                        if (!$filter("validatePostHeading")($scope.postModel.postHeading, notify)) {
                            errors++;
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostContent")($scope.postModel.postContent, notify)) {
                                errors++;
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostTags")($scope.postModel.postTags, notify)) {
                                errors++;
                            }
                        }
                        return errors == 0;
                    };

                    $scope.validateFinalizePostForm = function (notify) {
                        var errors = 0;
                        if (errors == 0) {
                            if (!$scope.postModel.postHeaderImageKey || $scope.postModel.postHeaderImageKey.length == 0) {
                                errors++;
                                $rootScope.main.showToast('warning', 'Please select the header image');
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostShortHeading")($scope.postModel.postShortHeading, notify)) {
                                errors++;
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostSummary")($scope.postModel.postSummary, notify)) {
                                errors++;
                            }
                        }
                        return errors == 0;
                    };


                    $scope.submitFinal = function () {
                        if ($scope.validateMainPostForm(true)) {

                            $scope.incrementStep();

                            PostService.submitPostUpdate($scope.postModel)
                                .success(function (resp) {
                                    var thePost = resp.thePost;
                                    $rootScope.main.responseStatusHandler(resp);
                                    //redirect to the post
                                    $rootScope.main.redirectToPage('/post/' + $filter('getSlugUrl')(thePost));
                                })
                                .error(function (errResponse) {
                                    $scope.previousStep();
                                    $rootScope.main.responseStatusHandler(errResponse);
                                    $rootScope.main.goToTop();
                                })
                        } else {
                            $rootScope.main.goToTop();
                        }
                    };

                    $scope.cancel = function () {
                        ngDialog.openConfirm({
                            template: 'confirm_cancel_post_update',
                            className: 'ngdialog-theme-default',
                            overlay: true,
                            showClose: true,
                            closeByEscape: true,
                            closeByDocument: true,
                            cache: true,
                            trapFocus: true,
                            preserveFocus: true
                        }).then(function () {
                            $rootScope.main.redirectToPage('/post/' + $filter('getSlugUrl')($scope.postModel));
                        }, function () {
                            //do nothing
                        });
                    };

                }

                /*end of continue rendering*/

                $scope.trashPost = function () {
                    if ($scope.postModel.postUniqueCuid) {
                        ngDialog.openConfirm({
                            template: '/views/dialogs/confirm-trash-post.html',
                            className: 'ngdialog-theme-default',
                            overlay: true,
                            showClose: false,
                            closeByEscape: false,
                            closeByDocument: false,
                            cache: true,
                            trapFocus: true,
                            preserveFocus: true
                        }).then(function () {
                            continueTrashing($scope.postModel.postUniqueCuid);
                        }, function () {
                            $scope.main.showToast('success', 'Deletion cancelled');
                        });
                    }

                    function continueTrashing(postUniqueCuid) {
                        trashPost(postUniqueCuid)
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $rootScope.main.redirectToHome();
                            })
                            .error(function (err) {
                                $rootScope.main.responseStatusHandler(err);
                            });
                    }
                };

                function trashPost(postUniqueCuid) {
                    return $http.post('/api/trashPost', {
                        postUniqueCuid: postUniqueCuid
                    });
                }
            }
        };
    }]);
angular.module('app')
    .directive('newPostDirectiveScope', ['$filter', '$rootScope', 'PostService', 'globals', '$http', '$interval', 'ngDialog', function ($filter, $rootScope, PostService, globals, $http, $interval, ngDialog) {
        return {
            restrict: 'AE',
            link: function ($scope, $element, $attrs) {

                var thisUser = {};

                /*get userData from the server again. This makes sure that the userData is available
                 * why? sometimes the controller loads faster than the initial requests*/
                globals.userDataFromServer()
                    .success(function (resp) {
                        $rootScope.main.responseStatusHandler(resp);
                        if (!resp.userData) {
                            $rootScope.main.redirectToLogin();
                        } else {
                            thisUser = resp.userData;
                            continueRendering();
                        }
                    })
                    .error(function (errResponse) {
                        $rootScope.main.responseStatusHandler(errResponse);
                    });

                function continueRendering() {

                    //postType can either be normal, video or art

                    $scope.postModel = {
                        allPostCategories: [],
                        postCategoryUniqueCuid: "",
                        postHeading: "",
                        postContent: "",
                        postSummary: "",
                        postTags: [],
                        postUploads: [],
                        postShortHeading: '',
                        postHeaderImageKey: '',
                        postType: 'normal',
                        authorUniqueCuid: thisUser.uniqueCuid,
                        writers: [],
                        step: 1

                    };

                    $scope.previousStep = function () {
                        $scope.postModel.step--;
                        $rootScope.main.goToTop();
                    };

                    $scope.incrementStep = function () {
                        $scope.postModel.step++;
                        $rootScope.main.goToTop();
                    };


                    $scope.nextStep = function (currentStep) {
                        //step 1 involves choosing the post category
                        if (parseInt(currentStep) == 1) {
                            if ($scope.postModel.postCategoryUniqueCuid.length == 0) {
                                $rootScope.main.showToast('warning', 'Please select a category');
                            } else if ($scope.postModel.postType.length == 0) {
                                $rootScope.main.showToast('warning', 'Please select the post type');
                            } else {
                                $scope.incrementStep();
                            }
                        }

                        //step 2 involves writing the post itself
                        if (parseInt(currentStep) == 2) {
                            if ($scope.validateMainPostForm(true)) {
                                $scope.incrementStep();
                            }
                        }

                        //step 2 involves finalizing the post
                        if (parseInt(currentStep) == 3) {
                            if ($scope.validateFinalizePostForm(true)) {
                                $scope.incrementStep();
                            }
                        }
                    };


                    $scope.getAllPostCategories = function () {
                        $http.post('/api/getPostCategories')
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.postModel.allPostCategories = resp.postCategoriesArray;
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    };
                    $scope.getAllWriters = function () {
                        $http.post('/api/getWriters')
                            .success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                $scope.postModel.writers = resp.usersArray;
                            })
                            .error(function (errResponse) {
                                $rootScope.main.responseStatusHandler(errResponse);
                            })
                    };
                    $scope.getAllPostCategories();
                    $scope.getAllWriters();

                    //broadcast here helps distinguish from the inform checking and the checking on submit, which requires notifications
                    //broadcast takes a boolean value
                    $scope.validateMainPostForm = function (notify) {
                        var errors = 0;
                        if (!$filter("validatePostHeading")($scope.postModel.postHeading, notify)) {
                            errors++;
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostContent")($scope.postModel.postContent, notify)) {
                                errors++;
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostTags")($scope.postModel.postTags, notify)) {
                                errors++;
                            }
                        }
                        return errors == 0;
                    };

                    $scope.validateFinalizePostForm = function (notify) {
                        var errors = 0;
                        if (errors == 0) {
                            if (!$scope.postModel.postHeaderImageKey || $scope.postModel.postHeaderImageKey.length == 0) {
                                errors++;
                                $rootScope.main.showToast('warning', 'Please select the header image');
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostShortHeading")($scope.postModel.postShortHeading, notify)) {
                                errors++;
                            }
                        }
                        if (errors == 0) {
                            if (!$filter("validatePostSummary")($scope.postModel.postSummary, notify)) {
                                errors++;
                            }
                        }
                        return errors == 0;
                    };


                    $scope.submitFinal = function () {
                        if ($scope.validateMainPostForm(true)) {

                            //$scope.incrementStep();

                            PostService.submitNewPost($scope.postModel).
                                success(function (resp) {
                                    var thePost = resp.thePost;
                                    $rootScope.main.responseStatusHandler(resp);
                                    $rootScope.main.redirectToPage('/post/' + $filter('getSlugUrl')(thePost));
                                })
                                .error(function (errResponse) {
                                    $scope.previousStep();
                                    $rootScope.main.responseStatusHandler(errResponse);
                                    $rootScope.main.goToTop();
                                })
                        } else {
                            $rootScope.main.goToTop();
                        }
                    };

                    $scope.cancel = function () {
                        ngDialog.openConfirm({
                            template: 'confirm_cancel_new_post',
                            className: 'ngdialog-theme-default',
                            overlay: true,
                            showClose: true,
                            closeByEscape: true,
                            closeByDocument: true,
                            cache: true,
                            trapFocus: true,
                            preserveFocus: true
                        }).then(function () {
                            $rootScope.main.redirectToHome();
                        }, function () {
                            //do nothing
                        });
                    };
                }

                /*end of continue rendering*/
            }
        }
    }]);
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

angular.module('app')
    .directive('headingMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="postHeading | postHeadingMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                postHeading: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostHeading")($scope.postHeading);
                };
            }
        }
    }])
    .directive('shortHeadingMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="postShortHeading | postShortHeadingMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                postShortHeading: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostShortHeading")($scope.postShortHeading);
                };
            }
        }
    }])
    .directive('contentMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="postContent | postContentMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                postContent: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostContent")($scope.postContent);
                }
            }
        }
    }])
    .directive('summaryMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="postSummary | postSummaryMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                postSummary: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostSummary")($scope.postSummary);
                }
            }
        }
    }])
    .directive('tagMessages', ['$filter', function ($filter) {
        return {
            template: '<span class="form-error-notice" ng-show="showSpan()">' +
            '<small ng-bind="postTags | postTagsMessages"></small>' +
            '</span>',
            restrict: 'AE',
            scope: {
                postTags: '=model'
            },
            link: function ($scope, $element, $attrs) {
                $scope.showSpan = function () {
                    return !$filter("validatePostTags")($scope.postTags);
                }
            }
        }
    }]);
angular.module('app')
    .directive('postUploader', ['$rootScope', 'globals', '$http', 'Upload', '$interval', function ($rootScope, globals, $http, Upload, $interval) {
        return {

            templateUrl: 'post_uploader.html',
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

                $scope.uploadDirect = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        if ($scope.selectedFileType.type === 'image') {
                            $scope.showUploading();
                            $http.post('/api/getImagePolicy', {
                                fileNameWithExtension: file.name
                            }).success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                uploadPostImageDirect(fields, file, resp);
                            })
                                .error(function (errResponse) {
                                    $rootScope.main.responseStatusHandler(errResponse);
                                    $scope.hideProgressBars();
                                });
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            $scope.showUploading();
                            $http.post('/api/getPdfPolicy', {
                                fileNameWithExtension: file.name
                            }).success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                uploadPdfDirect(fields, file, resp);
                            })
                                .error(function (errResponse) {
                                    $rootScope.main.responseStatusHandler(errResponse);
                                    $scope.hideProgressBars();
                                });
                        } else if ($scope.selectedFileType.type === 'zip') {
                            $scope.showUploading();
                            $http.post('/api/getZipPolicy', {
                                fileNameWithExtension: file.name
                            }).success(function (resp) {
                                $rootScope.main.responseStatusHandler(resp);
                                uploadZipDirect(fields, file, resp);
                            })
                                .error(function (errResponse) {
                                    $rootScope.main.responseStatusHandler(errResponse);
                                    $scope.hideProgressBars();
                                });
                        }
                    }
                };

                function uploadPostImageDirect(fields, file, details) {
                    Upload.upload({
                        url: details.s3BucketUrl,
                        method: 'POST',
                        fields: {
                            key: details.key,
                            AWSAccessKeyId: 'AKIAJ3ODSBXFCLG7A6UA',
                            acl: 'public-read',
                            policy: details.policy,
                            signature: details.signature,
                            "Content-Type": file.type != '' ? file.type : 'application/octet-stream',
                            filename: file.name
                        },
                        file: file
                    }).progress(function (evt) {
                        $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                    })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $rootScope.main.showToast('success', 'File successfully uploaded');
                            $scope.postModel.postUploads.push({
                                type: 'image',
                                data: {
                                    originalname: file.name,
                                    amazonS3Url: details.completePath
                                }
                            });
                            $scope.hideProgressBars();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.showToast('warning', 'There was a problem uploading file. Please ensure that the file format is valid, and the file does not exceed the maximum allowed size');
                            console.log(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                function uploadPdfDirect(fields, file, details) {
                    Upload.upload({
                        url: details.s3BucketUrl,
                        method: 'POST',
                        fields: {
                            key: details.key,
                            AWSAccessKeyId: 'AKIAJ3ODSBXFCLG7A6UA',
                            acl: 'public-read',
                            policy: details.policy,
                            signature: details.signature,
                            "Content-Type": file.type != '' ? file.type : 'application/octet-stream',
                            filename: file.name
                        },
                        file: file
                    }).progress(function (evt) {
                        $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                    })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $rootScope.main.showToast('success', 'File successfully uploaded');
                            $scope.postModel.postUploads.push({
                                type: 'pdf',
                                data: {
                                    originalname: file.name,
                                    amazonS3Url: details.completePath
                                }
                            });
                            $scope.hideProgressBars();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.showToast('warning', 'There was a problem uploading file. Please ensure that the file format is valid, and the file does not exceed the maximum allowed size');
                            console.log(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                function uploadZipDirect(fields, file, details) {
                    Upload.upload({
                        url: details.s3BucketUrl,
                        method: 'POST',
                        fields: {
                            key: details.key,
                            AWSAccessKeyId: 'AKIAJ3ODSBXFCLG7A6UA',
                            acl: 'public-read',
                            policy: details.policy,
                            signature: details.signature,
                            "Content-Type": file.type != '' ? file.type : 'application/octet-stream',
                            filename: file.name
                        },
                        file: file
                    }).progress(function (evt) {
                        $scope.uploading.percent = parseInt(100.0 * evt.loaded / evt.total);
                    })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $rootScope.main.showToast('success', 'File successfully uploaded');
                            $scope.postModel.postUploads.push({
                                type: 'zip',
                                data: {
                                    originalname: file.name,
                                    amazonS3Url: details.completePath
                                }
                            });
                            $scope.hideProgressBars();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.showToast('warning', 'There was a problem uploading file. Please ensure that the file format is valid, and the file does not exceed the maximum allowed size');
                            console.log(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                $scope.upload = function (files) {
                    if (files && files.length) {
                        var file = files[0];
                        var fields = {};
                        $scope.showUploading();
                        if ($scope.selectedFileType.type === 'image') {
                            uploadPostImage(fields, file);
                        } else if ($scope.selectedFileType.type === 'pdf') {
                            uploadPdf(fields, file);
                        } else if ($scope.selectedFileType.type === 'zip') {
                            uploadZip(fields, file);
                        }
                    }
                };

                function uploadPostImage(fields, file) {
                    uploadPostImageToServer(fields, file)
                        .progress(function (evt) {
                            $scope.uploading.percent = parseInt(80.0 * evt.loaded / evt.total);
                        })
                        .success(function (data, status, headers, config) {
                            $rootScope.main.responseStatusHandler(data);
                            $scope.postModel.postUploads.push({
                                type: 'image',
                                data: data.fileData
                            });
                            $scope.hideProgressBars();
                        })
                        .error(function (errResponse) {
                            $rootScope.main.responseStatusHandler(errResponse);
                            $scope.hideProgressBars();
                        });
                }
                function uploadPostImageToServer(fields, file) {
                    return Upload.upload({
                        url: globals.getLocationHost() + '/api/uploadPostImage',
                        fields: fields,
                        file: file
                    });
                }
            }
        }
    }]);