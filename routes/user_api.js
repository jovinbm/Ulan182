var fileName = 'user_api.js';

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

    updateUserDetails: function (req, res) {
        var app = rq.app();
        var module = 'updateUserDetails';
        receivedLogger(module);

        //these are validated in the forms
        var theUser = rq.getTheUser(req);
        var data = req.body.data;
        var availableKeys = ['firstName', 'lastName', 'username', 'email', 'statusLine', 'biography'];
        var dataKeys = [];

        Promise.resolve()
            .then(function () {
                if (theUser) {
                    return true;
                } else {
                    throw {
                        code: 'not-logged-in',
                        msg: 'You need to be logged in to perform this action.'
                    };
                }
            })
            .then(function () {
                if (typeof data === 'object') {
                    return true;
                } else {
                    throw {
                        code: 400,
                        msg: 'There was an error processing your request'
                    };
                }
            })
            .then(function () {
                //check if all keys exist in the list of the available keys to update;
                dataKeys = Object.keys(data);
                if (dataKeys.length === 0) {
                    throw {
                        code: 200
                    };
                } else {
                    var allExist = dataKeys.every(checkIfExists);
                    if (allExist) {
                        return true;
                    } else {
                        throw {
                            code: 400,
                            msg: 'There was an error processing your request'
                        };
                    }
                }

                function checkIfExists(key) {
                    return availableKeys.indexOf(key) !== -1;
                }
            })
            .then(function () {
                return rq.user_handler().updateUserDetails(theUser.uniqueCuid, data);
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                if (dataKeys.indexOf('username') !== -1) {
                    //if the username was changed, redirect to the new username page
                    //update the username in theUser
                    theUser.username = data.username;

                    res.status(200).send({
                        status: true,
                        redirect: true,
                        redirectPage: app.locals.getUserPrivateProfileUrl(theUser)
                    });
                } else {
                    //then just reload page
                    res.status(200).send({
                        status: true,
                        reload: true
                    });
                }

            })
            .catch(function (err) {
                if (err.code == 200) {
                    res.status(200).send({});
                } else {
                    throw err;
                }
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },


    updateUserPassword: function (req, res) {
        var module = 'updateUserPassword';
        receivedLogger(module);

        //these are validated in the forms
        var theUser = rq.getTheUser(req);
        var data = req.body.data;
        var availableKeys = ['oldPassword', 'newPassword', 'confirmNewPassword'];
        var dataKeys = [];

        Promise.resolve()
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
                if (typeof data === 'object') {
                    return true;
                } else {
                    throw {
                        code: 400,
                        msg: 'There was an error processing your request'
                    };
                }
            })
            .then(function () {
                //check if all keys exist in the list of the available keys to update;
                dataKeys = Object.keys(data);
                if (dataKeys.length === 0) {
                    throw {
                        code: 200
                    };
                } else {

                    var allExist = dataKeys.every(checkIfExists);
                    if (allExist) {
                        return true;
                    } else {
                        throw {
                            code: 400,
                            msg: 'There was an error processing your request'
                        };
                    }
                }

                function checkIfExists(key) {
                    return availableKeys.indexOf(key) !== -1;
                }
            })
            .then(function () {
                var options = {
                    oldPassword: data.oldPassword,
                    newPassword: data.newPassword,
                    confirmNewPassword: data.confirmNewPassword
                };
                return rq.user_handler().updateUserPassword(theUser.uniqueCuid, options);
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                //redirect user to log in page so that they can log in with their new password

                return rq.logout_handler().logoutClient(req, res);
            })
            .then(function () {
                res.status(200).send({
                    status: true,
                    redirect: true,
                    redirectPage: '/notLoggedIn'
                });
            })
            .catch(function (err) {
                if (err.code == 200) {
                    res.status(200).send({});
                } else {
                    throw err;
                }
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },

    updateUserFacebook: function (req, res) {
        var module = 'updateUserFacebook';
        receivedLogger(module);

        var theUser = rq.getTheUser(req);

        var options = {
            credentials: {
                accessToken: req.body.credentials.accessToken,
                signedRequest: req.body.credentials.signedRequest,
                userID: req.body.credentials.userID,
                dateConnected: req.body.credentials.dateConnected,
                expiresIn: req.body.credentials.expiresIn
            },
            profile: {
                firstName: req.body.profile.first_name,
                lastName: req.body.profile.last_name,
                name: req.body.profile.name,
                id: req.body.profile.id,
                gender: req.body.profile.gender,
                url: req.body.profile.link
            }
        };

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
                        msg: 'The data was invalid',
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
                        msg: 'The data was invalid',
                        code: 400
                    };
                }
            })
            .then(function () {
                return rq.functions().request.getUserFacebookLongLivedToken(options.credentials.accessToken)
                    .then(function (obj) {
                        options.credentials.accessToken = obj.accessToken;
                        options.credentials.expiresIn = obj.expiresIn;
                    });
            })
            .then(function () {
                return rq.user_handler().updateUserFacebook(theUser.uniqueCuid, options);
            })
            .then(function (obj) {
                rq.consoleLogger(successLogger(module));
                res.status(200).send({
                    code: 200,
                    notify: true,
                    type: 'success',
                    msg: 'Connected',
                    theUser: obj.theUser
                });
            })
            .catch(function (err) {
                if (err.code == 200) {
                    res.status(200).send({});
                } else {
                    throw err;
                }
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },

    deleteConnectedService: function (req, res) {
        var module = 'deleteConnectedService';
        receivedLogger(module);

        var theUser = rq.getTheUser(req);
        var serviceName = req.body.serviceName;

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
                if (serviceName) {
                    return rq.user_handler().deleteConnectedService(theUser.uniqueCuid, {
                        serviceName: serviceName
                    });
                } else {
                    throw {
                        err: new Error(errorLogger(module, 'Service = ' + serviceName)),
                        code: 400
                    };
                }
            })
            .then(function (obj) {
                rq.consoleLogger(successLogger(module));
                res.status(200).send({
                    code: 200,
                    notify: true,
                    type: 'success',
                    msg: 'Successfully removed.',
                    theUser: obj.theUser
                });
            })
            .catch(function (err) {
                if (err.code == 200) {
                    res.status(200).send({});
                } else {
                    throw err;
                }
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },

    resetPassword_email: function (req, res) {
        var module = 'resetPassword_email';
        receivedLogger(module);

        var email = req.body.email;

        return Promise.resolve()
            .then(function () {
                if (email) {
                    return true;
                } else {
                    throw {
                        code: 400,
                        msg: 'Please enter a valid email.'
                    };
                }
            })
            .then(function () {
                if (email) {
                    return rq.user_handler().resetPassword_email({
                        email: email
                    });
                } else {
                    throw {
                        msg: 'Please enter a valid email.',
                        code: 400
                    };
                }
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                res.status(200).send({
                    code: 200
                });
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    }

};
