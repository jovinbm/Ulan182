var fileName = 'user_db.js';

var Promise = require('bluebird');
var rq = require('../rq.js');
var _ = require('underscore');

var receivedLogger = function (module) {
    return rq.receivedLogger(module, fileName);
};

var successLogger = function (module, text) {
    return rq.successLogger(module, fileName, text);
};

var errorLogger = function (module, text, err) {
    return rq.errorLogger(module, fileName, text, err);
};

var bcrypt = Promise.promisifyAll(require('bcrypt'));

module.exports = {

    findUserWithUniqueCuid: function (uniqueCuid) {
        var module = 'findUserWithUniqueCuid';

        return rq.crud_db().find(rq.User(), new rq.Query({uniqueCuid: uniqueCuid}), true)
            .then(function (theUser) {
                return theUser;
            });
    },

    findUserWithUsername: function (username) {
        var module = 'findUserWithUsername';

        return rq.crud_db().find(rq.User(), new rq.Query({username: username}), true)
            .then(function (theUser) {
                return theUser;
            });
    },

    updateProfilePicture: function (uniqueCuid, link) {
        var module = 'updateProfilePicture';
        receivedLogger(module);

        var oldProfilePictureKey = '';

        return rq.user_db().findUserWithUniqueCuid(uniqueCuid)  //uniqueCuid of the user who wants to update their profile picture
            .then(function (theUser) {
                if (!theUser) {
                    throw {
                        err: new Error(errorLogger(module)),
                        code: 401,
                        logout: true,
                        msg: "You have been temporarily logged out. Please sign in."
                    };
                } else {
                    return theUser;
                }
            })
            .then(function (theUser) {
                oldProfilePictureKey = theUser.images.profilePicture;
                return true;
            })
            .then(function () {
                var query = new rq.Query();
                query.findQuery = {uniqueCuid: uniqueCuid};
                query.updateQuery = {
                    $set: {
                        'images.profilePicture': link
                    }
                };
                return rq.crud_db().update(rq.User(), query);
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return {
                    oldProfilePictureKey: oldProfilePictureKey
                };
            });

    },

    updateFullName: function (uniqueCuid, options) {
        var module = 'updateFullName';
        receivedLogger(module);

        var firstName = options.firstName;
        var lastName = options.lastName;

        return Promise.resolve()
            .then(function () {
                if (!firstName || !lastName) {
                    throw {
                        code: 400,
                        msg: 'First name and/or Last name are required'
                    };
                }
            })
            .then(function () {
                var query = new rq.Query();
                query.findQuery = {uniqueCuid: uniqueCuid};
                query.updateQuery = {
                    $set: {
                        firstName: firstName,
                        lastName: lastName
                    }
                };
                return rq.crud_db().update(rq.User(), query);
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return true;
            });
    },

    updateUsername: function (uniqueCuid, options) {
        var module = 'updateUsername';
        receivedLogger(module);

        var username = options.username;

        //check if username is already in use
        return rq.user_db().findUserWithUsername(username)
            .then(function (theUser) {
                if (theUser) {
                    //if its the same user then just continue
                    if (theUser.uniqueCuid === uniqueCuid) {
                        return true;
                    } else {
                        throw {
                            code: 400,
                            msg: 'The username is not available'
                        };
                    }
                } else {
                    return true;
                }
            })
            .then(function () {
                var query = new rq.Query();
                query.findQuery = {uniqueCuid: uniqueCuid};
                query.updateQuery = {
                    $set: {
                        username: username
                    }
                };
                return rq.crud_db().update(rq.User(), query);
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return true;
            });
    },

    updateEmail: function (uniqueCuid, options) {
        var module = 'updateEmail';
        receivedLogger(module);

        var email = options.email;

        //check if email is already in use
        return rq.crud_db().find(rq.User(), new rq.Query({email: email}), true)
            .then(function (theUser) {
                //if its the same user then just continue
                if (theUser) {

                    if (theUser.uniqueCuid === uniqueCuid) {
                        //if it's the same email'
                        if (theUser.email === email) {
                            throw {
                                code: 400,
                                msg: 'The email was already assigned to your account.'
                            };
                        } else {
                            return true;
                        }
                    } else {
                        throw {
                            code: 400,
                            msg: 'The email is already assigned to a different account. Forgot password? Try recovering from login screen.'
                        };
                    }

                } else {
                    return true;
                }
            })
            .then(function () {
                var query = new rq.Query();
                query.findQuery = {uniqueCuid: uniqueCuid};
                query.updateQuery = {
                    $set: {
                        email: email,
                        emailIsConfirmed: false
                    }
                };
                return rq.crud_db().update(rq.User(), query);
            })
            .then(function () {
                //resend email confirmation link
                return rq.user_db().findUserWithUniqueCuid(uniqueCuid)
                    .then(function (theUser) {
                        return rq.functions().email.sendConfirmEmailLink(theUser);
                    });
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return true;
            });
    },

    updateUserFacebook: function (uniqueCuid, obj) {
        /*
         * NB: you cannot retrieve and update these infos: you need to mark fireld as modified
         * if you do that
         * */
        var module = 'updateUserFacebook';
        receivedLogger(module);

        var options = {
            credentials: {
                accessToken: obj.credentials.accessToken,
                signedRequest: obj.credentials.signedRequest,
                userID: obj.credentials.userID,
                dateConnected: obj.credentials.dateConnected,
                expiresIn: obj.credentials.expiresIn
            },
            profile: {
                firstName: obj.profile.firstName,
                lastName: obj.profile.lastName,
                name: obj.profile.name,
                id: obj.profile.id,
                gender: obj.profile.gender,
                url: obj.profile.url
            }
        };

        return Promise.resolve()
            .then(function () {
                var query = new rq.Query();
                query.findQuery = {uniqueCuid: uniqueCuid};
                query.updateQuery = {
                    $set: {
                        "social.facebook": options
                    }
                };
                return rq.crud_db().update(rq.User(), query);
            })
            .then(function () {
                return rq.user_db().findUserWithUniqueCuid(uniqueCuid); //find the user
                //this is useful since when editing the details in the profile we only want to change
                //the social part that has changed so that if the user was already editing other parts of his/her
                //profile, the changes won't be lost
            })
            .then(function (user) {
                rq.consoleLogger(successLogger(module));
                return user;
            });
    },

    updateUserTwitter: function (uniqueCuid, obj) {
        /*
         * NB: you cannot retrieve and update these infos: you need to mark field as modified
         * if you do that
         * */
        var module = 'updateUserTwitter';
        receivedLogger(module);

        var options = {
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

        return Promise.resolve()
            .then(function () {
                var query = new rq.Query();
                query.findQuery = {uniqueCuid: uniqueCuid};
                query.updateQuery = {
                    $set: {
                        "social.twitter": options
                    }
                };
                return rq.crud_db().update(rq.User(), query);
            })
            .then(function () {
                return rq.user_db().findUserWithUniqueCuid(uniqueCuid); //find the user
                //this is useful since when editing the details in the profile we only want to change
                //the social part that has changed so that if the user was already editing other parts of his/her
                //profile, the changes won't be lost
            })
            .then(function (user) {
                return rq.user_db().removeSensitiveData(user);
            })
            .then(function (user) {
                rq.consoleLogger(successLogger(module));
                return user;
            });
    },

    deleteConnectedService: function (uniqueCuid, obj) {
        var module = 'deleteConnectedService';
        receivedLogger(module);

        var serviceName = obj.serviceName;
        var query = new rq.Query();
        query.findQuery = {uniqueCuid: uniqueCuid};

        switch (serviceName) {
            case 'facebook':
                query.updateQuery = {
                    $set: {
                        'social.facebook': {}
                    }
                };
                break;
            case 'twitter':
                query.updateQuery = {
                    $set: {
                        'social.twitter': {}
                    }
                };
                break;
            case 'linkedIn':
                query.updateQuery = {
                    $set: {
                        'social.linkedIn': {}
                    }
                };
                break;
            default:
                query.updateQuery = false;
        }

        return Promise.resolve()
            .then(function () {
                if (!uniqueCuid) {  //uniqueCuid of the user who wants to update their profile picture
                    throw {
                        err: new Error(errorLogger(module)),
                        code: 401,
                        logout: true,
                        msg: 'You have been temporarily logged out. Please sign in.'
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                if (serviceName) {
                    return rq.crud_db().update(rq.User(), query);
                } else {
                    throw {
                        err: new Error(errorLogger(module, 'The service does not exist')),
                        code: 400,
                        msg: 'Unfortunately the service you selected does not exist or is no longer supported'
                    };
                }
            })
            .then(function () {
                return rq.user_db().findUserWithUniqueCuid(uniqueCuid); //find the user
                //this is useful since when editing the details in the profile we only want to change
                //the social part that has changed so that if the user was already editing other parts of his/her
                //profile, the changes won't be lost
            })
            .then(function (user) {
                rq.consoleLogger(successLogger(module));
                return user;
            });
    },

    updateStatusLine: function (uniqueCuid, options) {
        var module = 'updateStatusLine';
        receivedLogger(module);

        var statusLine = options.statusLine;

        return Promise.resolve()
            .then(function () {
                var query = new rq.Query();
                query.findQuery = {uniqueCuid: uniqueCuid};
                query.updateQuery = {
                    $set: {
                        statusLine: statusLine
                    }
                };
                return rq.crud_db().update(rq.User(), query);
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return true;
            });
    },

    updateBiography: function (uniqueCuid, options) {
        var module = 'updateBiography';
        receivedLogger(module);

        var biography = options.biography;

        return Promise.resolve()
            .then(function () {
                var query = new rq.Query();
                query.findQuery = {uniqueCuid: uniqueCuid};
                query.updateQuery = {
                    $set: {
                        biography: biography
                    }
                };
                return rq.crud_db().update(rq.User(), query);
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return true;
            });
    },


    updatePassword: function (uniqueCuid, options) {
        var module = 'updatePassword';
        receivedLogger(module);

        var oldPassword = options.oldPassword;
        var newPassword = options.newPassword;

        return Promise.resolve()
            .then(function () {
                if (!oldPassword || !newPassword) {
                    throw {
                        code: 400,
                        msg: 'One or more password(s) missing'
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                return rq.user_db().findUserWithUniqueCuid(uniqueCuid);
            })
            .then(function (user) {  //the user who wants to update their profile picture
                if (!user) {
                    throw {
                        code: 401,
                        logout: true,
                        msg: 'You have been temporarily logged out. Please sign in.'
                    };
                } else {
                    return user;
                }
            })
            .then(function (user) {
                //compare old and initial passwords
                var c = Promise.promisify(bcrypt.compare, bcrypt);

                return c(oldPassword, user.password)
                    .catch(function (e) {
                        throw {
                            err: new Error(errorLogger(module, e)),
                            code: 500
                        };
                    })
                    .then(function (res) {
                        if (res) {
                            return true;
                        } else {
                            throw {
                                err: new Error(errorLogger(module)),
                                code: 401,
                                msg: 'The old password you entered is incorrect. Please check and try again'
                            };
                        }
                    });
            })
            .then(function () {
                //make the new password
                var h = Promise.promisify(bcrypt.hash, bcrypt);

                return h(newPassword, 10)
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
                var query = new rq.Query();
                query.findQuery = {uniqueCuid: uniqueCuid};
                query.updateQuery = {
                    $set: {
                        password: hashedPassword
                    }
                };
                return rq.crud_db().update(rq.User(), query);
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return true;
            });
    },

    confirmEmail: function (hashedUniqueCuid) {
        var module = 'confirmEmail';
        receivedLogger(module);

        //this function uses it's own catchers, t's miscellaneous for emails,
        //errors are treated differently

        return rq.User().findOne({hashedUniqueCuid: hashedUniqueCuid})
            .execAsync()
            .catch(function () {
                throw {
                    code: 600,
                    confirmed: false,
                    theUser: null,
                    showBanner: true,
                    bannerClass: 'alert alert-warning',
                    msg: 'There was a problem confirming your email. Please try again'
                };
            })
            .then(function (user) {
                if (!user) {
                    throw {
                        code: 404,
                        confirmed: false,
                        theUser: null,
                        showBanner: true,
                        bannerClass: 'alert alert-warning',
                        msg: 'We could not find a user with your credentials in our records. Please try again or create a new account'
                    };
                } else {
                    return user;
                }
            })
            .then(function (user) {
                if (user.emailIsConfirmed === true) {
                    throw {
                        code: 600,
                        confirmed: true,
                        theUser: user,
                        showBanner: true,
                        bannerClass: 'alert alert-success',
                        msg: 'Your email account was already confirmed. No need to confirm again'
                    };
                } else {
                    return user;
                }
            })
            .then(function (user) {
                user.emailIsConfirmed = true;
                return user;
            })
            .then(function (user) {
                return user.saveAsync()
                    .catch(function () {
                        throw {
                            code: 600,
                            confirmed: false,
                            theUser: null,
                            showBanner: true,
                            bannerClass: 'alert alert-warning',
                            msg: 'There was a problem confirming your email. Please try again'
                        };
                    })
                    .spread(function (theSavedUser) {
                        return theSavedUser;
                    });
            })
            .then(function (theSavedUser) {
                return {
                    confirmed: true,
                    theUser: theSavedUser,
                    showBanner: true,
                    bannerClass: 'alert alert-success',
                    msg: 'Your email has been successfully confirmed'
                };
            });
    },

    checkUserPassword: function (uniqueCuid, password) {
        var module = 'checkUserPassword';
        receivedLogger(module);

        rq.user_db().findUserWithUniqueCuid(uniqueCuid)
            .then(function (theUser) {
                if (!theUser) {
                    throw {
                        err: new Error(errorLogger(module)),
                        code: 404,
                        msg: 'We could not find the user with the given details'
                    };
                } else {
                    return theUser;
                }
            })
            .then(function (theUser) {
                return bcrypt.compareAsync(password, theUser.password)
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    });
            })
            .then(function (res) {
                rq.consoleLogger(successLogger(module));
                if (res) {
                    //means the password checks with hash
                    return 1;
                } else {
                    rq.consoleLogger(successLogger(module));
                    //passwords don't check
                    return -1;
                }
            });
    },

    getAllUsers: function () {
        var module = 'getAllUsers';
        receivedLogger(module);

        var query = new rq.Query();
        query.findQuery = {};
        query.returnQuery = {password: 0, _id: 0};
        query.sort = {firstName: 1};

        return rq.crud_db().find(rq.User(), query)
            .then(function (usersArray) {
                rq.consoleLogger(successLogger(module));
                return usersArray;
            });
    },

    searchUsers: function (obj) {
        var module = 'searchUsers';
        receivedLogger(module);

        var query = obj.query;
        var quantity = parseInt(obj.quantity);
        var requestedPage = parseInt(obj.requestedPage);

        //if query === 'all', then just return all users
        return Promise.resolve()
            .then(function () {
                if (query === 'all') {

                    var resObj = {
                        page: requestedPage,
                        totalPages: 1,
                        totalResults: 1,
                        users: []
                    };

                    return rq.crud_db().count(rq.User(), new rq.Query({}))
                        .then(function (total) {
                            resObj.totalResults = total;
                            resObj.totalPages = Math.ceil(total / quantity) || 1;
                        })
                        .then(function () {
                            //fix the requestedPage if needed
                            if (requestedPage > resObj.totalPages) {
                                resObj.page = resObj.totalPages;
                            }

                            if (requestedPage < 1) {
                                resObj.page = 1;
                            }

                            if (!_.isNumber(requestedPage)) {
                                resObj.page = 1;
                            }

                            return resObj;
                        })
                        .then(function () {
                            var query = new rq.Query();
                            query.findQuery = {};
                            query.skip = resObj.totalResults === 0 ? 0 : quantity * (resObj.page - 1);
                            query.limit = quantity;
                            query.sort = {firstName: 1};

                            return rq.crud_db().find(rq.User(), query)
                                .then(function (usersArray) {
                                    resObj.users = usersArray;
                                    return true;
                                });
                        })
                        .then(function () {
                            rq.consoleLogger(successLogger(module));
                            return resObj;
                        });


                } else {

                    //perform the search for the requested users

                    //number of users to return = 100000 == default
                    //filter the results based on quantity
                    var options = {
                        limit: 100000, //can't put limit quantity here because it will not allow skipping when another page is requested
                        lean: true
                    };

                    var output;

                    var textSearchAsync = Promise.promisify(rq.User().textSearch, rq.User());

                    return textSearchAsync(query, options)
                        .catch(function (err) {
                            throw {
                                err: new Error(errorLogger(module, err)),
                                code: 500
                            };
                        })
                        .then(function (theOutPut) {
                            output = theOutPut;
                            //output is an object that contains 3 major keys:
                            //1:"results" = array of objects with 2 keys: "score" and "object" <--carries the post
                            //2:"stats" = result metadata containing: nscanned (number) == total number of results in the query, nscannedObjects(number) --nearly same as nscanned
                            // see mongodb docs, n(number) -- number of documents returned == limit if nscanned > limit, timeMicros(number)
                            //3:"ok" == 1 if search went well

                            //prepare an object that contains pages and uniqueCuids of the current search results:
                            return {
                                page: requestedPage,
                                totalPages: Math.ceil(theOutPut.stats.nscanned / quantity),
                                totalResults: theOutPut.stats.nscanned,
                                users: []
                            };
                        })
                        .then(function (resultObject) {
                            //fix the requestedPage if needed
                            if (requestedPage > resultObject.totalPages) {
                                resultObject.page = resultObject.totalPages;
                            }

                            if (requestedPage < 1) {
                                resultObject.page = 1;
                            }

                            if (!_.isNumber(requestedPage)) {
                                resultObject.page = 1;
                            }

                            return resultObject;
                        })
                        .then(function (resultObject) {
                            //filter the results of the requested page
                            var numToSkip = quantity * (resultObject.page - 1);

                            //remove the un-needed at the end
                            output.results.splice(numToSkip + quantity);

                            //remove the un-needed at the beginning
                            if (numToSkip > 0) {
                                output.results.splice(0, numToSkip);
                            }

                            //push the rest
                            resultObject.users = resultObject.users.concat(output.results);
                            return resultObject;
                        })
                        .then(function (resultObject) {
                            //remove the score in the array (default format of the results) only put the obj
                            resultObject.users = resultObject.users.map(function (obj) {
                                return obj.obj;
                            });

                            return resultObject;
                        })
                        .then(function (resultObject) {
                            rq.consoleLogger(successLogger(module));
                            return resultObject;
                        });
                }
            });
    }
};