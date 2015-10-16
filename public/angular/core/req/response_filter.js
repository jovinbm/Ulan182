angular.module('app')
    .filter("responseFilter", ['$q', '$log', '$window', '$rootScope', function ($q, $log, $window, $rootScope) {
        return function (resp) {

            if (resp !== null && typeof resp === 'object') {
                if (resp.redirect) {
                    if (resp.redirectPage) {
                        $window.location.href = resp.redirectPage;
                    }

                    if (resp.redirectState) {
                        $rootScope.main.changeState(resp.redirectState)
                    }

                    return;
                }
                if (resp.reload) {
                    $rootScope.main.reloadPage();
                    return;
                }
                if (resp.notify) {
                    if (resp.type && resp.msg) {
                        $rootScope.main.showIonicAlert('Info', resp.msg);
                        return;
                    }
                }
                if (resp.dialog) {
                    if (resp.id) {
                        switch (resp.id) {
                            case "not-authorized":
                                $rootScope.main.showIonicAlert('Info', 'You are not authorized to be/access this page or resource.');
                                break;
                            case "sign-in":
                                $rootScope.main.showIonicAlert('Info', 'Please sign in to continue.')
                                    .then(function () {
                                        $rootScope.main.changeState('login')
                                    });
                                break;
                            default:
                            //do nothing
                        }
                        return;
                    }
                }
                if (resp.banner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.main.showIonicAlert('Info', resp.msg);
                        return;
                    }
                }
                if (resp.signInBanner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.main.showIonicAlert('Info', resp.msg);
                        return;
                    }
                }
                if (resp.registrationBanner) {
                    if (resp.bannerClass && resp.msg) {
                        $rootScope.main.showIonicAlert('Info', resp.msg);
                        return;
                    }
                }
                if (resp.reason) {
                    $log.warn(resp.reason);
                }
            } else {
                //do nothing
            }
        };
    }]);