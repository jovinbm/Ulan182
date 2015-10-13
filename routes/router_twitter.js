var fileName = 'router_twitter.js';

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

var passport = require('passport');

module.exports = {
    connectToTwitter: function (req, res, next) {
        var app = require('../app.js').app();
        var module = 'connectToTwitter';
        receivedLogger(module);

        var theUser = rq.getTheUser(req);

        var options = {};

        return Promise.resolve()
            .then(function () {
                if (theUser) {
                    return true;
                } else {
                    throw {
                        code: 401,
                        logout: true,
                        msg: 'You need to be logged in to perform this action.'
                    };
                }
            })
            .then(function () {
                return new Promise(function (resolve, reject) {
                    passport.authenticate('twitter', function (err, obj) {
                        resolve([err, obj]);
                    })(req, res, next);
                });
            })
            .spread(function (err, obj) {
                if (err) {
                    throw {
                        code: 500,
                        msg: err.msg || 'An error occurred. Please try again.'
                    };
                } else {
                    return [err, obj];
                }
            })
            .spread(function (err, obj) {
                if (!obj) {
                    throw {
                        //just redirect back to their page, the user has decided not to offer us the permissions
                        code: 200
                    };
                } else {
                    return obj;
                }
            })
            .then(function (obj) {
                options = {
                    credentials: {
                        token: obj.credentials.token,
                        tokenSecret: obj.credentials.tokenSecret
                    },
                    profile: {
                        id: obj.profile.id,
                        username: obj.profile.username,
                        name: obj.profile.name,
                        url: obj.profile.url
                    }
                };
                return true;
            })
            .then(function () {
                for (var p in options.credentials) {
                    if (options.credentials.hasOwnProperty(p)) {
                        if (!p) {
                            error();
                            break;
                        }
                    }
                }
                function error() {
                    throw {
                        msg: 'Incomplete transaction with twitter',
                        code: 400
                    };
                }
            })
            .then(function () {
                for (var q in options.profile) {
                    if (options.profile.hasOwnProperty(q)) {
                        if (!q) {
                            error();
                            break;
                        }
                    }
                }
                function error() {
                    throw {
                        msg: 'Incomplete transaction with twitter',
                        code: 400
                    };
                }
            })
            .then(function () {
                return rq.user_handler().updateUserTwitter(theUser.uniqueCuid, options);
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return res.redirect(app.locals.getUserPrivateProfileUrl(theUser) + '?tab=edit-details'); //redirect back to the original page
            })
            .catch(function (err) {
                if (err.code === 200) {
                    return res.redirect(app.locals.getUserPrivateProfileUrl(theUser) + '?tab=edit-details'); //redirect back to the original page
                } else {
                    throw err;
                }
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    }
};