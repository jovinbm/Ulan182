var fileName = 'error.js';

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


/*
 * Only the e.msg are sent to be presented to the user. The e.err are used to print the stack trace
 * */

module.exports = {
    catchExcessErrors: function (e) {
        var rq = require('../rq.js');
        return Promise.resolve()
            .then(function () {
                if (!e.code) {
                    throw {
                        err: e,
                        code: 500
                    };
                } else {
                    throw e;
                }
            });
    },

    catchNonXhrErrors: function (req, res, e, isPartial) {
        var rq = require('../rq.js');
        return Promise.resolve()
            .then(function () {
                if (e.err) {
                    if (e.err.message) {
                        rq.consoleLogger(e.err.message);
                    }
                }

                throw e;
            })
            .catch(function (e) {
                if (e.code === 301 && e.redirectPath) {
                    console.log(e.redirectPath);
                    res.redirect(301, e.redirectPath);
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 302 && e.redirectPath) {
                    res.redirect(302, e.redirectPath);
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 400 || e.code == 600) { //600s are just normal errors that occur, most of them deserve a 200 response
                    rq.routes().error().render_friendly_html(req, res, {
                        msg: e.msg || 'There was a problem with your request. Please check and try again',
                        errorCode: 400,
                        partial: isPartial
                    });
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 401) {
                    if (e.logout) {
                        req.logout();
                        req.session.destroy(function () {
                            rq.routes().account().render_not_logged_in(req, res);
                        });
                    } else {
                        rq.routes().error().render_friendly_html(req, res, {
                            msg: e.msg || "We were unable to authenticate your request. Please make sure you are signed in.",
                            errorCode: 401,
                            partial: isPartial
                        });
                    }
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 403) {
                    rq.routes().error().render_friendly_html(req, res, {
                        msg: e.msg || "You don't have the permissions to access this page or feature.",
                        errorCode: 403,
                        partial: isPartial
                    });
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 404) {
                    rq.routes().error().render_friendly_html(req, res, {
                        msg: e.msg || 'We were unable to retrieve the page, and(or) some components of the page. Please reload this page',
                        errorCode: 404,
                        partial: isPartial
                    });
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                rq.showErrorStack(e);
                rq.routes().error().render_friendly_html(req, res, {
                    msg: e.msg || "An error occurred while processing your request. Please try again",
                    errorCode: 500,
                    partial: isPartial
                });
            });
    },

    catchXhrErrors: function (req, res, e) {
        var rq = require('../rq.js');
        return Promise.resolve()
            .then(function () {
                if (e.err) {
                    if (e.err.message) {
                        rq.consoleLogger(e.err.message);
                    }
                }
                throw e;
            })
            .catch(function (e) {
                if (e.code === 301 && e.redirectPath) {
                    res.status(200).send({
                        code: 301,
                        notify: true,
                        type: 'warning',
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: e.msg || '',
                        redirect: true,
                        redirectPage: e.redirectPath
                    });
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 302 && e.redirectPath) {
                    res.status(200).send({
                        code: 301,
                        notify: true,
                        type: 'warning',
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: e.msg || '',
                        redirect: true,
                        redirectPage: e.redirectPath
                    });
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 400 || e.code == 600) { //600s are just normal errors that occur, most of them deserve a 200 response
                    res.status(400).send({
                        code: 400,
                        notify: true,
                        type: 'warning',
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: e.msg || 'There was a problem with your request. Please check and try again'
                    });
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 401) {
                    if (e.logout) {
                        req.logout();
                        req.session.destroy(function () {
                            res.status(401).send({
                                code: 401,
                                banner: true,
                                bannerClass: 'alert alert-dismissible alert-warning',
                                dialog: true,
                                id: 'sign-in',
                                msg: e.msg || 'Please sign in to continue.'
                            });
                        });
                    } else {
                        res.status(401).send({
                            code: 401,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: e.msg || "We were unable to authenticate your request. Please make sure you are signed in."
                        });
                    }
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 403) {
                    res.status(403).send({
                        code: 403,
                        notify: true,
                        type: 'warning',
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: e.msg || "You don't have the permissions to access this page or feature."
                    });
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code === 404) {
                    res.status(404).send({
                        code: 404,
                        notify: true,
                        type: 'warning',
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: e.msg || "We could not find the requested resource. Please check the URL and try again."
                    });
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                rq.showErrorStack(e);
                res.status(500).send({
                    code: 500,
                    notify: true,
                    type: 'warning',
                    banner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: e.msg || "An error occurred while processing your request. Please try again."
                });
            });
    },

    showErrorStack: function (e) {
        if (e) {
            if (e.err) {
                if (e.err.stack) {
                    rq.consoleLogger(e.err.stack);
                }
                if (!e.err.message || !e.err.stack) {
                    rq.consoleLogger('**************** SHOWERRORSTACK called with e.err == ' + e.err);
                }
            } else if (e.msg) {
                showDetails(e);
            } else if (e.stack) {
                //means this is just a normal error object
                rq.consoleLogger(e.stack);
            } else {
                rq.consoleLogger(e);
            }

        } else {
            rq.consoleLogger('***************** SHOWERRORSTACK called with e == ' + e);
        }


        //function shows other error details available in the passed obj in new lines
        function showDetails(obj) {
            var line = '';
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    line = line + p + ' = ' + obj[p] + ' && ';
                }
            }
            rq.consoleLogger(line);
        }
    },

    catchEmptyArgs: function (arrOfArguments) {
        var errors = 0;
        var missing_args = [];
        return Promise.resolve()
            .then(function () {
                if (typeof arrOfArguments == 'object') {
                    var len = arrOfArguments.length;
                    for (var i = 0; i < len; i++) {
                        if (!arrOfArguments[i]) {
                            errors++;
                            missing_args.push(i);
                        }
                    }
                } else {
                    throw {
                        err: new Error('arrOfArguments should be an array'),
                        code: 500
                    };
                }
            })
            .then(function () {
                if (errors > 0) {
                    throw {
                        err: new Error(errors + ' important arguments are missing: Missing args are ' + JSON.stringify(missing_args)),
                        code: 500
                    };
                }
            })
    },

    catchUberErrors: function (req, res, statusCode, resBody) {
        var rq = require('../rq.js');

        return Promise.resolve()
            .then(function () {
                rq.consoleLogger(statusCode);
                rq.consoleLogger(resBody);
                return true;
            })
            .then(function () {
                if (statusCode == 200 || statusCode == 201) {
                    return true;
                } else {
                    throw new Error(statusCode);
                }
            })
            .catch(function (e) {
                if (statusCode === 400) { //600s are just normal errors that occur, most of them deserve a 200 response
                    res.status(400).send({
                        code: 400,
                        notify: true,
                        type: 'warning',
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: 'We encountered a problem while trying to make that request. Please check and try again'
                    });
                } else if (statusCode.code === 401) {
                    req.logout();
                    req.session.destroy(function () {
                        res.status(401).send({
                            code: 401,
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            dialog: true,
                            id: 'sign-in',
                            msg: 'Please sign in to continue.'
                        });
                    });
                } else if (statusCode.code === 403) {
                    res.status(403).send({
                        code: 403,
                        notify: true,
                        type: 'warning',
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: "This application appears to have no permissions to make that request."
                    });
                } else {
                    res.status(500).send({
                        code: statusCode,
                        notify: true,
                        type: 'warning',
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: e.msg || "An error occurred while processing your request. Please try again."
                    });
                }
            });
    },

    /*
     * errors that happen specifically when requesting an uber
     * */
    catchRequestUberErrors: function (req, res, statusCode, resBody) {
        var rq = require('../rq.js');

        return Promise.resolve()
            .then(function () {
                rq.consoleLogger(statusCode);
                rq.consoleLogger(resBody);
                return true;
            })
            .then(function () {
                if (statusCode == 200 || statusCode == 201) {
                    return true;
                } else {
                    throw new Error(statusCode);
                }
            })
            .catch(function (e) {

                var firstError = resBody.errors;

                if (firstError) {
                    firstError = firstError[0];

                    if (statusCode === 400 && firstError.code == 'unconfirmed_email') {
                        return {
                            code: 400,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'Please confirm your email address within the native mobile application or by visiting https://riders.uber.com.'
                        };
                    } else if (statusCode === 400 && firstError.code == 'invalid_payment') {
                        return {
                            code: 400,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'Please update your billing info within the native mobile application or by visiting https://riders.uber.com.'
                        };
                    } else if (statusCode === 403 && firstError.code == 'forbidden') {
                        return {
                            code: 403,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'You have been forbidden from making a request at this time Please consult Uber support team by visiting https://help.uber.com or by emailing support@uber.com.'
                        };

                    } else if (statusCode === 403 && firstError.code == 'unverified') {
                        return {
                            code: 403,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'You have not confirmed your mobile number.Use the native mobile application or by visiting https://riders.uber.com to confirm.'
                        };

                    } else if (statusCode === 403 && firstError.code == 'product_not_allowed') {
                        return {
                            code: 403,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'The product being requested is not available. Please select a different product.'
                        };

                    } else if (statusCode === 403 && firstError.code == 'pay_balance') {
                        return {
                            code: 403,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'The product being requested is not available. Please select a different product.'
                        };

                    } else if (statusCode === 403 && firstError.code == 'user_not_allowed') {
                        return {
                            code: 403,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'There are conflicting balance issues in your account. Please update using the native mobile application or by visiting https://riders.uber.com.'
                        };

                    } else if (statusCode === 403 && firstError.code == 'too_many_cancelations') {
                        return {
                            code: 403,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'You have been temporarily blocked due to cancelling too many times.'
                        };

                    } else if (statusCode === 404 && firstError.code == 'not_found') {
                        return {
                            code: 404,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'An error occurred while attempting to make the request. Please reload the page.'
                        };

                    } else if (statusCode === 409 && firstError.code == 'no_drivers_available') {
                        return {
                            code: 409,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'No drivers available for requested product at this time. You can wait or try a different product.'
                        };

                    } else if (statusCode === 409 && firstError.code == 'missing_payment_method') {
                        return {
                            code: 409,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'Please add a payment method by using the native mobile application or by visiting https://riders.uber.com.'
                        };

                    } else if (statusCode === 409 && firstError.code == 'fare_expired') {
                        return {
                            code: 409,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'The fare has expired for the requested product. Please get select the product again, confirm the new fare, and then re-request.'
                        };

                    } else if (statusCode === 409 && firstError.code == 'retry_request') {
                        return {
                            code: 409,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'An error occurred while attempting to make the request. Please try again.'
                        };

                    } else if (statusCode === 409 && firstError.code == 'error') {
                        return {
                            code: 409,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'An unknown error occurred while attempting to make the request. Please try again.'
                        };

                    } else if (statusCode === 422 && firstError.code == 'mobile_number_conflic') {
                        return {
                            code: 409,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'Your mobile number has already been claimed by an existing Uber account. You can update your mobile number within the native mobile application, by visiting https://riders.uber.com.'
                        };

                    } else if (statusCode === 422 && firstError.code == 'third_party_account _already_associated') {
                        return {
                            code: 409,
                            notify: true,
                            type: 'warning',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'This account is already associated with existing Uber account.'
                        };
                    } else {
                        return {
                            code: 200,
                            notify: true,
                            type: 'success',
                            banner: true,
                            bannerClass: 'alert alert-dismissible alert-warning',
                            msg: 'We are requesting your ride...'
                        };
                    }

                } else {

                    //means there are no errors

                    return {
                        code: 200,
                        notify: true,
                        type: 'success',
                        banner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: 'We are requesting your ride...'
                    };

                }
            });
    }
};