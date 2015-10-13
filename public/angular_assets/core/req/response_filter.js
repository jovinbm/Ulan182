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