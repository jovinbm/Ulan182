var fileName = 'passport.js';

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

var TwitterStrategy = require('passport-twitter').Strategy;
var bcrypt = require('bcrypt');
var cuid = require('cuid');

module.exports = function (app, passport, LocalStrategy) {

    app.post('/api/getUserData', getUserData);
    app.post('/api/getUberAuthorizationUrl', rq.functions().middleware.ensureAuthenticatedXhr, rq.functions().middleware.addUserData, getUberAuthorizationUrl);
    app.get('/api/uberauth/callback', rq.functions().middleware.ensureAuthenticatedXhr, rq.functions().middleware.addUserData, saveUberToken);
    app.post('/api/createAccount', createAccount);
    app.post('/api/localUserLogin', localUserLogin);
    app.post('/api/logoutClient', rq.functions().middleware.ensureAuthenticatedXhr, rq.functions().middleware.addUserData, logoutClient);

    function getUserData(req, res) {
        var module = 'getUserData';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (req.isAuthenticated()) {
                    return req.user;
                } else {
                    return null;
                }
            })
            .then(function (user) {
                rq.consoleLogger(successLogger(module));
                return res.status(200).send({
                    userData: user
                });
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    }

    function localUserLogin(req, res, next) {
        var module = 'app.post /localUserLogin';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (!req.body.username && !req.body.password) {
                    throw {
                        code: 401,
                        msg: 'Some fields are missing. Please check and try again.'
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                return new Promise(function (resolve) {
                    passport.authenticate('local', function (err, user, info) {
                        resolve([err, user, info]);
                    })(req, res, next);
                });
            })
            .spread(function (err, user, info) {
                if (err) {
                    throw {
                        code: 500,
                        msg: info.msg || 'An error occurred. Please try again.'
                    };
                } else {
                    return [err, user, info];
                }
            })
            .spread(function (err, user, info) {
                if (!user) {
                    throw {
                        code: 401,
                        msg: info.msg || 'We were unable to authenticate you. Please check and try again.'
                    };
                } else {
                    return [err, user, info];
                }
            })
            .spread(function (err, user, info) {
                return new Promise(function (resolve, reject) {
                    req.logIn(user, function (err) {
                        if (err) {
                            reject({
                                code: 500,
                                err: err
                            });
                        } else {
                            resolve(true);
                        }
                    });
                });
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return res.status(200).send({
                    code: 200,
                    msg: "You have successfully logged in",
                    redirect: true,
                    redirectState: 'home'
                });
            })
            .catch(function (err) {
                if (err.code == 600 || err.code == 401 || err.code == 400) {
                    return res.status(401).send({
                        code: 401,
                        signInBanner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: err.msg || 'An error occurred. Please try again.'
                    });
                } else {
                    throw err;
                }
            })
            .catch(function (err) {
                rq.showErrorStack(err);
                return res.status(500).send({
                    code: 500,
                    signInBanner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: "A problem occurred when trying to log you in. Please try again"
                });
            });
    }

    function logoutClient(req, res) {
        var module = 'logoutClient';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                return new Promise(function (resolve, reject) {
                    req.logout();
                    req.session.destroy(function (err) {
                        if (err) {
                            reject({
                                code: 500,
                                err: new Error(errorLogger(module, err))
                            });
                        } else {
                            resolve(true);
                        }
                    });
                });
            })
            .then(function (e) {
                rq.consoleLogger(successLogger(module));
                return res.status(200).send({
                    code: 200,
                    redirect: true,
                    redirectState: 'index'
                });
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    }

    function createAccount(req, res) {
        var module = "createAccount";

        var isApproved = true;

        var email = req.body.email;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var username = req.body.username;
        var password = req.body.password1;
        var uniqueCuid = cuid();


        return Promise.resolve()
            .then(function () {
                //this function validates the form and calls formValidated on success
                return rq.functions().forms.validateRegistrationForm(firstName, lastName, username, email, password, req.body.password2);
            })
            .then(function () {
                //check that nobody is using that username
                return rq.user_db().findUserWithUsername(username);
            })
            .then(function (theUser) {
                if (theUser) {
                    throw {
                        code: 401,
                        msg: 'The username is not available. Please choose a different one.'
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                //check that nobody is using the same email
                return rq.crud_db().find(rq.User(), new rq.Query({email: email}), true);
            })
            .then(function (theUser) {
                if (theUser) {
                    throw {
                        code: 401,
                        msg: 'The email is already assigned to a different account. Forgot password? Try recovering.'
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                var h = Promise.promisify(bcrypt.hash, bcrypt);
                return h(password, 10)
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    })
                    .then(function (hash) {
                        return hash;
                    });
            })
            .then(function (hashedPassword) {
                return new rq.User()({
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    username: username,
                    password: hashedPassword,
                    uniqueCuid: uniqueCuid,
                    hashedUniqueCuid: cuid(),
                    isApproved: isApproved,
                    social: {
                        facebook: {},
                        twitter: {},
                        linkedIn: {}
                    }
                });
            })
            .then(function (theUser) {
                //log this user into session

                return new Promise(function (resolve, reject) {
                    req.login(theUser, function (err) {
                        if (err) {
                            reject({
                                err: new Error(errorLogger(module, err)),
                                code: 500
                            });
                        } else {
                            resolve(theUser);
                        }
                    });
                });
            })
            .then(function (theUser) {
                return rq.crud_db().save(theUser);
            })
            .then(function (theUser) {
                rq.consoleLogger(successLogger(module));

                res.status(200).send({
                    code: 200,
                    redirect: true,
                    redirectState: 'home'
                });
            })
            .catch(function (err) {
                return new Promise(function (resolve, reject) {
                    if (req.isAuthenticated()) {
                        req.logout();
                        req.session.destroy(function (err) {
                            if (err) {
                                reject({
                                    err: new Error(errorLogger(module, err)),
                                    code: 500
                                });
                            } else {
                                //continue passing the error
                                reject(err);
                            }
                        });
                    } else {
                        reject(err);
                    }
                });
            })
            .catch(function (err) {
                //catches 600s
                if (err.code == 600 || err.code == 401 || err.code == 400) {
                    res.status(401).send({
                        code: 401,
                        registrationBanner: true,
                        bannerClass: 'alert alert-dismissible alert-warning',
                        msg: err.msg
                    });
                    return true;
                } else {
                    throw err;
                }
            })
            .catch(function (err) {
                rq.showErrorStack(err);
                res.status(401).send({
                    code: 401,
                    registrationBanner: true,
                    bannerClass: 'alert alert-dismissible alert-warning',
                    msg: 'Failed to create your account. Please try again'
                });
            });
    }

    passport.use(new LocalStrategy(
        function (username, password, done) {
            var module = 'LocalStrategy';
            receivedLogger(module);

            return rq.functions().forms.passportValidateUsernameAndPassword(username, password)
                .then(function () {
                    return rq.user_db().findUserWithUsername(username);
                })
                .then(function (user) {
                    if (!user || Object.keys(user).length === 0) {
                        throw {
                            err: new Error(errorLogger(module)),
                            code: 400,
                            msg: 'Oops! We could not find a user with the provided username.'
                        };
                    } else {
                        return user;
                    }
                })
                .then(function (user) {
                    var c = Promise.promisify(bcrypt.compare, bcrypt);
                    return c(password, user.password)
                        .catch(function () {
                            throw {
                                err: new Error(errorLogger(module)),
                                code: 500
                            };
                        })
                        .then(function (res) {
                            if (res) {
                                return user;
                            } else {
                                throw {
                                    err: new Error(errorLogger(module)),
                                    code: 400,
                                    msg: 'The password you entered is incorrect. Please check and try again'
                                };
                            }
                        });
                })
                .then(function (theUser) {
                    return done(null, theUser);
                })
                .catch(function (err) {      //these functions involve the done() method hence they employ their own catchers here
                    if (err.code == 500) {
                        return done(err, false, {
                            msg: "A problem occurred when trying to log you in. Please try again"
                        });
                    } else {
                        return done(null, false, {
                            msg: err.msg
                        });
                    }
                });
        }
    ));

    passport.use(new TwitterStrategy({

            consumerKey: process.env.twitterConsumerKey,
            consumerSecret: process.env.twitterConsumerSecret,
            callbackURL: process.env.NODE_ENV === 'production' ? 'https://www.africanexponent.com/auth/twitter/callback' : 'http://local.africanexponent.com:3000/auth/twitter/callback'

        }, function (token, tokenSecret, profile, done) {

            var module = 'TwitterStrategy';
            receivedLogger(module);

            var Twitter = require('twitter-node-client').Twitter;
            var config = {
                "consumerKey": process.env.twitterConsumerKey,
                "consumerSecret": process.env.twitterConsumerSecret,
                "accessToken": process.env.twitterAccessToken,
                "accessTokenSecret": process.env.twitterAccessTokenSecret,
                "callBackUrl": process.env.NODE_ENV === 'production' ? 'https://www.africanexponent.com/auth/twitter/callback' : 'http://local.africanexponent.com:3000/auth/twitter/callback'
            };

            var twitter = new Twitter(config);


            var options = {
                credentials: {
                    token: token,
                    tokenSecret: tokenSecret
                },
                profile: {
                    id: profile.id,
                    username: profile.username,
                    name: '',
                    url: 'https://twitter.com/' + profile.username
                }
            };

            return Promise.resolve()
                .then(function () {
                    //get this user's full profile info
                    return new Promise(function (resolve, reject) {
                        twitter.getUser({
                            user_id: options.profile.id
                        }, function (err) {
                            reject({
                                code: 500,
                                err: new Error(errorLogger(module, err))
                            });
                        }, function (data) {
                            resolve(data);
                        });
                    });
                })
                .then(JSON.parse)
                .then(function (data) {
                    options.profile.username = data.screen_name;
                    options.profile.name = data.name;
                    options.profile.url = 'https://twitter.com/' + data.screen_name;
                    return true;
                })
                .then(function () {
                    return done(null, options);
                })
                .catch(function (err) {    //these functions involve the done() method hence they employ their own catchers here
                    return done(err, false, {
                        msg: 'We were unable to complete the authentication with twitter. Please check and try again.'
                    });

                });
        })
    );

    function getUberAuthorizationUrl(req, res) {

        return Promise.resolve()
            .then(function () {

                var url;
                if (process.env.NODE_ENV == 'production') {
                    url = 'https://login.uber.com/oauth/v2/authorize?' +
                        'response_type=code' +
                        '&redirect_uri=' + encodeURIComponent('https://www.pluschat.net/api/uberauth/callback') +
                        '&scope=request history profile' +
                        '&client_id=' + rq.uber.defaults.client_id;
                } else {
                    url = 'https://login.uber.com/oauth/v2/authorize?' +
                        'response_type=code' +
                        '&redirect_uri=' + encodeURIComponent('http://localhost:7000/api/uberauth/callback') +
                        '&scope=request history profile' +
                        '&client_id=' + rq.uber.defaults.client_id;
                }

                return res.status(200).send({
                    url: url
                })
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    }

    function saveUberToken(req, res) {
        var module = 'saveUberToken';
        var uAuthorization = Promise.promisify(rq.uber.authorization, rq.uber);
        return Promise.resolve()
            .then(function () {
                var authorization_code = req.query.code;
                return uAuthorization({
                    authorization_code: authorization_code
                });
            })
            .spread(function (access_token, refresh_token) {

                var theUser = rq.getTheUser(req);
                console.log(theUser);

                return Promise.resolve()
                    .then(function () {
                        if (!theUser) {
                            throw {
                                err: new Error(errorLogger(module, 'Not logged in')),
                                msg: 'Please make sure you are logged in first',
                                code: 401
                            };
                        } else {
                            return true;
                        }
                    })
                    .then(function () {
                        var query = new rq.Query();
                        query.findQuery = {uniqueCuid: theUser.uniqueCuid};
                        query.updateQuery = {
                            $set: {
                                "uber.access_token": access_token,
                                "uber.refresh_token": refresh_token
                            }
                        };
                        return rq.crud_db().update(rq.User(), query);
                    })
            })
            .catch(function (e) {
                if (!e.code) {
                    throw {
                        err: e,
                        msg: 'A problem occurred while performing the authorization with uber. Please try again.',
                        code: 401
                    };
                } else {
                    throw e;
                }
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return res.status(200).redirect('/');
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    }

    passport.serializeUser(function (user, done) {
        //only save the user uniqueCuid into the session to keep the data stored low
        done(null, user.uniqueCuid);
    });

    passport.deserializeUser(function (uniqueCuid, done) {

        //deserialize the saved uniqueCuid in session and find the user with the userId
        rq.user_db().findUserWithUniqueCuid(uniqueCuid)
            .then(function (theUser) {
                return done(null, theUser);
            })
            .catch(function () {
                return done(null, false);
            });
    });

};