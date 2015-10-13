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