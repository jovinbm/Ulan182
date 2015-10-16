var fileName = 'middleware.js';

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

function getFullQueryWithQMark(req) {
    if (req.originalUrl) {
        if (req.originalUrl.indexOf('?') != -1) {
            return req.originalUrl.substr(req.originalUrl.indexOf('?'));
        } else {
            return '?';
        }
    } else {
        return '?';
    }
}

module.exports = {

    authenticateToken: function (req, res, next) {
        var module = 'authenticateToken';
        receivedLogger(module);

        var jwt = require('jsonwebtoken');

        var bearerToken;
        var bearerHeader = req.headers["authorization"];

        if (typeof bearerHeader !== 'undefined') {
            var bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];
            req.token = bearerToken;
        } else {
            req.token = null;
        }

        /*
         * check the header
         * */
        if (req.query.ubtoken) {
            req.token = (req.query.ubtoken);
        }

        return Promise.resolve()
            .then(function () {
                if (req.token) {

                    return new Promise(function (resolve, reject) {
                        // verifies secret and checks exp
                        jwt.verify(req.token, process.env.uberTokenSeed, function (err, decoded) {

                            if (err) {
                                rq.showErrorStack(err);
                                req.isAuthenticated = function () {
                                    return false;
                                };
                                req.user = null;
                                resolve(true);

                            } else {

                                Promise.resolve()
                                    .then(function () {
                                        var query = new rq.Query();
                                        query.findQuery = {token: req.token};
                                        query.lean = true;
                                        return rq.crud_db().find(rq.User(), query, true);
                                    })
                                    .then(function (user) {
                                        if (user) {
                                            req.isAuthenticated = function () {
                                                return true;
                                            };
                                            req.user = user;
                                            resolve(true);
                                        } else {
                                            req.isAuthenticated = function () {
                                                return false;
                                            };
                                            req.user = null;
                                            resolve(true);
                                        }
                                    })
                                    .catch(function (e) {
                                        rq.showErrorStack(e);
                                        req.isAuthenticated = function () {
                                            return false;
                                        };
                                        req.user = null;
                                        resolve(true);
                                    })

                            }
                        });
                    })

                } else {

                    req.isAuthenticated = function () {
                        return false;
                    };
                    req.user = null;
                }


            })
            .catch(function (e) {
                rq.showErrorStack(e);
                return true;
            })
            .then(function () {
                next();
            })
    },

    addUserLocationData: function (req, res, next) {
        var module = "addUserLocationData";
        receivedLogger(module);

        var Cookies = require("cookies");
        var cookies = new Cookies(req, res);

        Promise.resolve()
            .then(function () {

                var userLocation = cookies.get("app.userLocation");

                if (userLocation) {
                    /*
                     the angular frontEnd uses the 'app.' prefix to separate it's cookies
                     it also should create an object when storing the value, this object will contain the various properties that will be stored
                     * the object is then JSON.stringified and stored in the cookie
                     * */

                    userLocation = decodeURIComponent(userLocation); //**Angular local-storage encodes the cookies
                    userLocation = JSON.parse(userLocation); //the values in the cookie's are stringified
                    userLocation = userLocation.value; //access the value property

                    if (typeof userLocation === 'object') {
                        if (userLocation.country) {
                            return {
                                country: userLocation.country
                            };
                        } else {
                            return noLocation(userLocation);
                        }
                    } else {
                        return noLocation(userLocation);
                    }
                } else {
                    return noLocation(userLocation);
                }

                function noLocation(userLocation) {
                    rq.consoleLogger("userLocation = " + userLocation);
                    return {
                        country: null
                    };
                }
            })
            .then(function (locationData) {
                req.userLocation = locationData;
                next();
            })
            .catch(function (e) {
                rq.showErrorStack(e);
                next();
            });
    },

    addLastPage: function (req, res, next) {
        var module = "addLastPage";
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (req.session) {
                    switch (req.route.path) {
                        case "/partial/posts":
                            req.session.lastPage = '/posts' + getFullQueryWithQMark(req);
                            break;
                        case "/partial/search/posts":
                            req.session.lastPage = '/search/posts' + getFullQueryWithQMark(req);
                            break;
                        default:
                            req.session.lastPage = req.originalUrl;
                    }
                }

                return true;
            })
            .then(function () {
                next();
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    },

    //authenticates requests
    ensureAuthenticated: function (req, res, next) {
        var module = "ensureAuthenticated";
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (req.isAuthenticated()) {
                    rq.consoleLogger(successLogger(module));
                    next();
                } else {
                    throw {
                        code: 401,
                        logout: true,
                        msg: 'Please sign in to continue'
                    };
                }
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    },

    ensureAuthenticatedXhr: function (req, res, next) {
        var module = "ensureAuthenticatedXhr";
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (req.isAuthenticated()) {
                    rq.consoleLogger(successLogger(module));
                    next();
                } else {
                    throw {
                        code: 401,
                        logout: true,
                        msg: 'Please sign in to continue'
                    };
                }
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },

    addUserData: function (req, res, next) {
        var module = "addUserData";
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (req.user) {
                    if (req.customData) {
                        req.customData.theUser = req.user;
                        next();
                    } else {
                        req.customData = {};
                        req.customData.theUser = req.user;
                        next();
                    }
                } else {
                    throw {
                        code: 401,
                        logout: true,
                        msg: 'Please sign in to continue'
                    };
                }
            })
            .catch(function (e) {
                //rq.catchNonXhrErrors(req, res, e);
                rq.catchXhrErrors(req, res, e);
            });
    },

    checkAccountStatus: function (req, res, next) {
        var module = "checkAccountStatus";
        receivedLogger(module);

        var theUser = rq.getTheUser(req);

        return Promise.resolve()
            .then(function () {
                if (theUser) {
                    if (theUser.emailIsConfirmed && theUser.isApproved && !theUser.isBanned.status) {
                        success();
                    } else {
                        error();
                    }
                } else {
                    error();
                }

                function success() {
                    next();
                }

                function error() {
                    throw {
                        code: 403,
                        msg: "You don't have the authorization to access this page or feature."
                    };
                }
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });

    },

    checkAccountStatusXhr: function (req, res, next) {
        var module = "checkAccountStatusXhr";
        receivedLogger(module);

        Promise.resolve()
            .then(function () {
                return rq.getTheUser(req);
            })
            .then(function (theUser) {
                if (!theUser) {
                    throw {
                        err: new Error(errorLogger(module)),
                        code: 401,
                        logout: true,
                        msg: "We could not find your records. Please reload page. If problem persists contact us for more information"
                    };
                } else {
                    return theUser;
                }
            })
            .then(function (theUser) {
                if (theUser.emailIsConfirmed === false) {
                    throw {
                        err: new Error(errorLogger(module)),
                        code: 403,
                        msg: "Please confirm your account by clicking the confirmation link we sent on your email. If you just created your account recently, please allow up to 10 minutes for the email to be delivered"
                    };
                }
                else {
                    return theUser;
                }
            })
            .then(function (theUser) {
                if (theUser.isApproved === false) {
                    throw {
                        err: new Error(errorLogger(module)),
                        code: 403,
                        msg: "Your account is awaiting approval from the administrators. Please allow up to 3 business days. You will get an email notification as soon as your account is approved"
                    };
                }
                else {
                    return theUser;
                }
            })
            .then(function (theUser) {
                if (theUser.isBanned) {
                    if (theUser.isBanned.status === true) {
                        throw {
                            err: new Error(errorLogger(module)),
                            code: 403,
                            msg: "Your have been banned from this service. Please contact the administrators for more information"
                        };
                    } else {
                        return theUser;
                    }
                }
                else {
                    return theUser;
                }
            })
            .then(function () {
                next();
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });

    },

    checkUserIsAdmin: function (req, res, next) {
        var permissions = rq.functions().permissions;
        var module = "checkUserIsAdminXhr";
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (permissions.isAdmin(req.customData.theUser)) {
                    rq.consoleLogger(successLogger(module));
                    next();
                } else {
                    throw {
                        code: 403,
                        msg: "You don't have the permissions to access this page or feature."
                    };
                }
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    },

    checkUserIsAdminXhr: function (req, res, next) {
        var permissions = rq.functions().permissions;
        var module = "checkUserIsAdmin";
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (permissions.isAdmin(req.customData.theUser)) {
                    rq.consoleLogger(successLogger(module));
                    next();
                } else {
                    throw {
                        code: 403,
                        msg: "You don't have the permissions to access this page or feature."
                    };
                }
            });
    },

    checkAdminLevel: function (req, res, levelsArray) {
        var module = "checkAdminLevel";
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                return rq.getTheUser(req);
            })
            .then(function (theUser) {
                return new Promise(function (resolve) {

                    var len = levelsArray.length;
                    var counter = 0;
                    var grantPermission = true;

                    check();

                    function check() {
                        if (counter < len && grantPermission === true) {
                            if (theUser.adminLevels.indexOf(levelsArray[counter]) < 0) {
                                grantPermission = false;
                            }
                            counter++;
                            check();
                        } else {
                            /*correct to allow admins to access*/
                            /*if they both have it then grant*/
                            if (levelsArray.indexOf(100) > -1 && theUser.adminLevels.indexOf(100) > -1) {
                                grantPermission = true;
                            }

                            /*if universal admin, just grant*/
                            if (theUser.adminLevels.indexOf(101) > -1) {
                                grantPermission = true;
                            }

                            resolve(grantPermission);
                        }
                    }
                });

            })
            .then(function (grantPermission) {
                if (!grantPermission) {
                    throw {
                        err: new Error(errorLogger(module)),
                        code: 403,
                        msg: "You do not have the permissions to access the page or feature you were looking for."
                    };
                } else {
                    return true;
                }
            });

        //!!errors here are handled by the calling functions! No need to call rq.catchXhrErrors/catchNonXhrErrors
    },

    checkUserUberConnection: function (req, res, next) {
        var module = "checkUserUberConnection";

        var Uber = require('node-uber');
        var uber = new Uber({
            client_id: process.env.uberClientId,
            client_secret: process.env.uberClientSecret,
            server_token: process.env.uberServerToken,
            redirect_uri: 'http://localhost:7000/api/uberauth/callback',
            name: 'ubLan'
        });

        receivedLogger(module);
        var user_access_token = req.customData.theUser;

        return Promise.resolve()
            .then(function () {
                if (!user_access_token) {
                    throw {
                        err: new Error(errorLogger(module, 'No access token found')),
                        code: 401,
                        msg: 'Important! Your account needs to be connected to Uber'
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                return new Promise(function (res, rej) {
                    uber.user.profile({
                        access_token: user_access_token
                    }, function (err, res) {
                        if (err) {
                            rej({
                                code: 401,
                                msg: 'Important! Your account needs to be reconnected to Uber'
                            })
                        } else {
                            res(true);
                        }
                    });
                })
            })
            .then(function () {
                next();
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },

    checkIfSocialCrawler: function (req) {
        var module = 'checkIfSocialCrawler';
        var userAgent = req.headers["user-agent"];

        if (userAgent) {
            if (userAgent.indexOf("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)") > -1 || userAgent.indexOf("facebookexternalhit/1.1") > -1 || userAgent.indexOf("Facebot") > -1) {
                rq.consoleLogger(successLogger(module, 'FACEBOOK CRAWLER DETECTED.....'));
                return true;
            } else if (userAgent.indexOf("Twitterbot") > -1) {
                rq.consoleLogger(successLogger(module, 'TWITTER CRAWLER DETECTED.....'));
                return true;
            }
            else {
                return false;
            }
        } else {
            return false;
        }
    },

    useHttp: function (req, res, next) {

        if (process.env.NODE_ENV !== 'production') {
            return next();
        }

        var protocol = req.headers["x-forwarded-proto"]; //headers from nginx

        if (protocol === 'https') {
            return Promise.resolve()
                .then(function () {
                    throw {
                        code: 301,
                        redirectPath: 'http://www.pluschat.net' + req.originalUrl
                    };
                })
                .catch(function (e) {
                    rq.catchNonXhrErrors(req, res, e);
                });
        } else {
            next();
        }
    },

    useHttps: function (req, res, next) {
        if (process.env.NODE_ENV !== 'production') {
            return next();
        }

        var protocol = req.headers["x-forwarded-proto"]; //headers from nginx

        if (protocol === 'http') {
            return Promise.resolve()
                .then(function () {
                    throw {
                        code: 301,
                        redirectPath: 'http://www.pluschat.net' + req.originalUrl
                    };
                })
                .catch(function (e) {
                    rq.catchNonXhrErrors(req, res, e);
                });
        } else {
            next();
        }
    }
};