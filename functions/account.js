var fileName = 'account.js';

var Promise = require('bluebird');
var rq = require('../rq.js');

var receivedLogger = function (module) {
    return rq.receivedLogger(module, fileName);
};

var successLogger = function (module, text) {
    return rq.successLogger(module, fileName, text);
};

var errorLogger = function (module, text, err) {
    return rq.errorLogger(module, fileName, text, err);
};

module.exports = {

    returnUserWithUniqueCuid: function (userUniqueCuid) {
        var module = "returnUserWithUniqueCuid";
        receivedLogger(module);

        return rq.user_db().findUserWithUniqueCuid(userUniqueCuid)
            .then(function (theUser) {
                return theUser;
            });
    },

    returnAccountStatusBanner: function (userData) {
        if (userData) {
            if (!userData.emailIsConfirmed) {
                return {
                    show: true,
                    bannerClass: "alert alert-warning",
                    msg: "Please confirm your account by clicking the confirmation link we sent on your email. If you just created your account recently, please allow up to 10 minutes for the email to be delivered",
                    showResendEmail: true,
                    accountStatus: false
                };
            } else if (userData.isApproved === false) {
                return {
                    show: true,
                    bannerClass: "alert alert-warning",
                    msg: "Your account is awaiting approval from the administrators. Please allow up to 3 business days. You will get an email notification as soon as your account is approved.",
                    showResendEmail: false,
                    accountStatus: false
                };
            } else if (userData.isBanned) {
                if (userData.isBanned.status === true) {
                    //checking banned status
                    return {
                        show: true,
                        bannerClass: "alert alert-warning",
                        msg: "Your have been banned from this service. Please contact the administrators for more information",
                        showResendEmail: false,
                        accountStatus: false
                    };
                } else {
                    return {
                        show: false,
                        bannerClass: "",
                        msg: "",
                        showResendEmail: false,
                        accountStatus: true
                    };
                }
            } else {
                return {
                    show: false,
                    bannerClass: "",
                    msg: "",
                    showResendEmail: false,
                    accountStatus: true
                };
            }
        } else {
            return {
                show: false,
                bannerClass: "",
                msg: "",
                showResendEmail: false,
                accountStatus: true
            };
        }
    }
};