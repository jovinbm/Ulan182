var fileName = 'forms_db.js';

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

var usernameRegex = /^[a-zA-Z0-9_]*$/;
var emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
var passwordRegex = /^[a-zA-Z0-9_]*$/;
var noWhiteSpaceRegex = /\S/;

module.exports = {
    validateRegistrationForm: function (firstName, lastName, username, email, password1, password2) {
        var module = 'validateRegistrationForm';
        receivedLogger(module);

        return Promise.resolve(arguments)
            .then(function (args) {
                var errors = 0;

                //check that all args exist i.e. all fields are not null
                for (var i = 0, len = args.length; i < len; i++) {
                    if (errors === 0) {
                        if (!args[i]) {
                            errors++;
                            error('An error occurred. Some fields missing. Please try again');
                        }
                    }
                }

                //check the firstName
                if (errors === 0) {
                    if (firstName.length > 30) {
                        error('First name should have at most 30 characters');
                        ++errors;
                    }
                }

                if (errors === 0) {
                    if (firstName.length < 2) {
                        error('First name should have at least 2 characters');
                        ++errors;
                    }
                }

                //check the lastName
                if (errors === 0) {
                    if (lastName.length > 30) {
                        ++errors;
                        error('Last name should have at most 30 characters');
                    }
                }

                if (errors === 0) {
                    if (lastName.length < 2) {
                        ++errors;
                        error('Last name should have at least 2 characters');
                    }
                }

                //check the username
                if (errors === 0) {
                    if (!(usernameRegex.test(username))) {
                        ++errors;
                        error('Please enter a valid username. Only letters, numbers and underscores allowed');
                    }
                }

                if (errors === 0) {
                    if (username.length > 10) {
                        ++errors;
                        error('Username should have at most 10 characters');
                    }
                }

                if (errors === 0) {
                    if (username.length < 4) {
                        ++errors;
                        error('Username should have at least 2 characters');
                    }
                }

                //check the email
                if (errors === 0) {
                    if (!(emailRegex.test(email))) {
                        ++errors;
                        error('Please enter a valid email');
                    }
                }

                //check passwords
                if (errors === 0) {
                    if (!(passwordRegex.test(password1))) {
                        ++errors;
                        error('Please enter a valid password. Only letters, numbers and underscores allowed');
                    }
                }

                if (errors === 0) {
                    if ((password1 != password2)) {
                        ++errors;
                        error("The passwords you entered don't match");
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },


    validateUpdateDetailsForm: function (options) {
        var module = 'validateUpdateDetailsForm';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                var errors = 0;

                //check the firstName
                if (options.firstName) {
                    var firstName = options.firstName;
                    if (errors === 0) {
                        if (firstName.length > 30) {
                            error('First name should have at most 30 characters');
                            ++errors;
                        }
                    }

                    if (errors === 0) {
                        if (firstName.length < 2) {
                            error('First name should have at least 2 characters');
                            ++errors;
                        }
                    }
                }

                //check the lastName
                if (options.lastName) {
                    var lastName = options.lastName;
                    if (errors === 0) {
                        if (lastName.length > 30) {
                            ++errors;
                            error('Last name should have at most 30 characters');
                        }
                    }

                    if (errors === 0) {
                        if (lastName.length < 2) {
                            ++errors;
                            error('Last name should have at least 2 characters');
                        }
                    }
                }

                //check the username
                if (options.username) {
                    var username = options.username;
                    if (errors === 0) {
                        if (!(usernameRegex.test(username))) {
                            ++errors;
                            error('Please enter a valid username. Only letters, numbers and underscores allowed');
                        }
                    }

                    if (errors === 0) {
                        if (username.length > 10) {
                            ++errors;
                            error('Username should have at most 10 characters');
                        }
                    }

                    if (errors === 0) {
                        if (username.length < 4) {
                            ++errors;
                            error('Username should have at least 4 characters');
                        }
                    }
                }

                //check the email
                if (options.email) {
                    if (errors === 0) {
                        var email = options.email;
                        if (!(emailRegex.test(email))) {
                            ++errors;
                            error('Please enter a valid email');
                        }
                    }
                }

                //check statusLine
                if (options.statusLine) {
                    var statusLine = options.statusLine;

                    if (errors === 0) {
                        if (statusLine.length > 100) {
                            ++errors;
                            error('The status should have at most 100 characters');
                        }
                    }
                }

                //check biography
                if (options.biography) {
                    var biography = options.biography;

                    if (errors === 0) {
                        if (biography.length > 300) {
                            ++errors;
                            error('The status should have at most 100 characters');
                        }
                    }
                }


                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },

    validateUpdatePasswordForm: function (options) {
        var module = 'validateUpdatePasswordForm';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                var errors = 0;
                var passwords = [];
                passwords.push(options.oldPassword);
                passwords.push(options.newPassword);
                passwords.push(options.confirmNewPassword);

                for (var i = 0; i < passwords.length; i++) {
                    if (errors === 0) {
                        if (!passwords[i] || typeof passwords[i] !== 'string') {
                            ++errors;
                            error('Please enter a valid passwords. Only letters, numbers and underscores allowed');
                        }
                    }
                }

                for (var j = 0; j < passwords.length; j++) {
                    if (errors === 0) {
                        if (!(passwordRegex.test(passwords[j]))) {
                            ++errors;
                            error('Please enter a valid passwords. Only letters, numbers and underscores allowed');
                        }
                    }
                }

                if (errors === 0) {
                    if ((options.newPassword != options.confirmNewPassword)) {
                        ++errors;
                        error("The passwords you entered don't match");
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },


    validateFullName: function (options) {
        var module = 'validateFullName';
        receivedLogger(module);

        var firstName = options.firstName;
        var lastName = options.lastName;

        return Promise.resolve()
            .then(function () {
                var errors = 0;

                if (errors === 0) {
                    if (!firstName) {
                        error('The first name is required');
                        ++errors;
                    }
                }

                if (errors === 0) {
                    if (!lastName) {
                        error('The last name is required');
                        ++errors;
                    }
                }

                //check the firstName
                if (errors === 0) {
                    if (firstName.length > 30) {
                        error('First name should have at most 30 characters');
                        ++errors;
                    }
                }

                if (errors === 0) {
                    if (firstName.length < 2) {
                        error('First name should have at least 2 characters');
                        ++errors;
                    }
                }

                //check the lastName
                if (errors === 0) {
                    if (lastName.length > 30) {
                        ++errors;
                        error('Last name should have at most 30 characters');
                    }
                }

                if (errors === 0) {
                    if (lastName.length < 2) {
                        ++errors;
                        error('Last name should have at least 2 characters');
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },


    validateEmail: function (options) {
        var module = 'validateEmail';
        receivedLogger(module);

        var email = options.email;

        return Promise.resolve()
            .then(function () {
                var errors = 0;

                if (errors === 0) {
                    if (!email) {
                        error('The email is required');
                        ++errors;
                    }
                }

                //check the email
                if (errors === 0) {
                    if (!(emailRegex.test(email))) {
                        ++errors;
                        error('Please enter a valid email');
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },


    validateUsername: function (username) {
        var module = 'validateUsername';
        receivedLogger(module);

        return Promise.resolve(arguments)
            .then(function (args) {
                var errors = 0;

                //check that all args exist i.e. all fields are not null
                for (var i = 0, len = args.length; i < len; i++) {
                    if (errors === 0) {
                        if (!args[i]) {
                            errors++;
                            error('An error occurred. Some fields missing. Please try again');
                        }
                    }
                }

                //check the username
                if (errors === 0) {
                    if (!(usernameRegex.test(username))) {
                        ++errors;
                        error('Please enter a valid username. Only letters, numbers and underscores allowed');
                    }
                }

                if (errors === 0) {
                    if (username.length > 10) {
                        ++errors;
                        error('Username should have at most 10 characters');
                    }
                }

                if (errors === 0) {
                    if (username.length < 4) {
                        ++errors;
                        error('Username should have at least 4 characters');
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },

    validatePassword: function (password) {
        var module = 'validatePassword';
        receivedLogger(module);

        return Promise.resolve(arguments)
            .then(function (args) {
                var errors = 0;

                //check that all args exist i.e. all fields are not null
                for (var i = 0, len = args.length; i < len; i++) {
                    if (errors === 0) {
                        if (!args[i]) {
                            errors++;
                            error('An error occurred. Some fields missing. Please try again');
                        }
                    }
                }

                //check passwords
                if (errors === 0) {
                    if (!(passwordRegex.test(password))) {
                        ++errors;
                        error('Please enter a valid password. Only letters, numbers and underscores allowed');
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },

    validateUserFacebook: function (options) {
        var module = 'validateUserFacebook';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                var errors = 0;

                if (errors === 0) {
                    if (!options.credentials.accessToken || !options.credentials.signedRequest || !options.credentials.userID || !options.credentials.dateConnected || !options.credentials.expiresIn) {
                        ++errors;
                        error('The data was invalid');
                    }
                }

                if (errors === 0) {
                    if (!options.profile.firstName || !options.profile.lastName || !options.profile.name || !options.profile.id || !options.profile.gender || !options.profile.url) {
                        ++errors;
                        error('The data was invalid');
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },

    validateUserTwitter: function (options) {
        var module = 'validateUserTwitter';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                var errors = 0;

                if (errors === 0) {
                    if (!options.credentials.token || !options.credentials.tokenSecret) {
                        ++errors;
                        error('There was an error in the data retrieved from twitter');
                    }
                }

                if (errors === 0) {
                    if (!options.profile.id || !options.profile.username || !options.profile.name || !options.profile.url) {
                        ++errors;
                        error('There was an error in the data retrieved from twitter');
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },

    validateContactUs: function (email, message) {
        var module = 'validateContactUs';
        receivedLogger(module);

        return Promise.resolve(arguments)
            .then(function (args) {
                var errors = 0;

                //check that all args exist i.e. all fields are not null
                for (var i = 0, len = args.length; i < len; i++) {
                    if (errors === 0) {
                        if (!args[i]) {
                            errors++;
                            error('An error occurred. Some fields missing. Please try again');
                        }
                    }
                }

                //check the email
                if (errors === 0) {
                    if (!(emailRegex.test(email))) {
                        ++errors;
                        error('Please enter a valid email');
                    }
                }

                if (errors === 0) {
                    if (message) {
                        if (message.length === 0) {
                            ++errors;
                            error('Please enter a message');
                        }
                    } else {
                        ++errors;
                        error('Please enter a message');
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },

    passportValidateUsernameAndPassword: function (username, password) {
        var module = 'passportValidateUsernameAndPassword';
        receivedLogger(module);

        return Promise.resolve(arguments)
            .then(function (args) {
                var errors = 0;

                //check that all args exist i.e. all fields are not null
                for (var i = 0, len = args.length; i < len; i++) {
                    if (errors === 0) {
                        if (!args[i]) {
                            errors++;
                            error('An error occurred. Some fields missing. Please try again');
                        }
                    }
                }

                //check the username
                if (errors === 0) {
                    if (!(usernameRegex.test(username))) {
                        ++errors;
                        error('Please enter a valid username. Only letters, numbers and underscores allowed');
                    }
                }

                if (errors === 0) {
                    if (username.length > 10) {
                        ++errors;
                        error('Username should have at most 10 characters');
                    }
                }

                if (errors === 0) {
                    if (username.length < 4) {
                        ++errors;
                        error('Username should have at least 4 characters');
                    }
                }

                //check passwords
                if (errors === 0) {
                    if (!(passwordRegex.test(password))) {
                        ++errors;
                        error('Please enter a valid password. Only letters, numbers and underscores allowed');
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },

    validateSearchUsers: function (options) {
        var module = 'validateSearchUsers';
        receivedLogger(module);

        return Promise.resolve(arguments)
            .then(function () {
                var errors = 0;

                var query = options.query;
                var quantity = parseInt(options.quantity);

                //validate query no whitespace
                //check that at least at least one character is non-whitespace

                if (errors === 0) {
                    if (!query) {
                        ++errors;
                        error('The search query cannot be empty');
                    }
                }

                if (errors === 0) {
                    if (!(noWhiteSpaceRegex.test(query))) {
                        ++errors;
                        error('The search query cannot be empty');
                    }
                }

                if (errors === 0) {
                    if (query.length === 0 && errors === 0) {
                        ++errors;
                        error('The search query cannot be empty');
                    }
                }

                if (errors === 0) {
                    if (!quantity) {
                        ++errors;
                        error('Quantity is not specified');
                    }
                }


                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },

    validateMainSearchQuery: function (queryString) {
        var module = 'validateMainSearchQuery';
        receivedLogger(module);

        return Promise.resolve(arguments)
            .then(function (args) {
                var errors = 0;

                //check that all args exist i.e. all fields are not null
                for (var i = 0, len = args.length; i < len; i++) {
                    if (errors === 0) {
                        if (!args[i]) {
                            errors++;
                            error('An error occurred. Some fields missing. Please try again');
                        }
                    }
                }

                //validate query no whitespace
                //check that at least at least one character is non-whitespace
                if (errors === 0) {
                    if (!(noWhiteSpaceRegex.test(queryString))) {
                        ++errors;
                        error('The search query cannot be empty');
                    }
                }

                if (errors === 0) {
                    if (queryString.length === 0 && errors === 0) {
                        ++errors;
                        error('The search query cannot be empty');
                    }
                }


                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    },


    validatePermissionsUpdate: function (req, res, options) {
        var module = 'validatePermissionsUpdate';
        receivedLogger(module);

        var theUser = req.user;
        var newPermissionsArray = options.newPermissionsArray;
        var userUniqueCuid = options.userUniqueCuid;

        return Promise.resolve()
            .then(function () {
                if (!theUser) {
                    error();
                } else if (newPermissionsArray.constructor != Array) {
                    error();
                } else if (!userUniqueCuid) {
                    error();
                } else {
                    return true;
                }

                function error() {
                    throw {
                        err: new Error(errorLogger(module, 'Some fields are incorrect')),
                        code: 500
                    };
                }
            })
            .then(function () {
                var errors = 0;
                //check the permissions
                for (var i = 0; i < newPermissionsArray.length; i++) {
                    if (errors === 0) {
                        newPermissionsArray[i] = parseInt(newPermissionsArray[i]);
                        if (isNaN(newPermissionsArray[i])) {
                            errors++;
                        }
                    }
                }

                if (errors > 0) {
                    throw {
                        code: 500,
                        err: new Error(errorLogger(module, 'One or more permissions isNaN'))
                    };
                } else {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }
            });
    },


    checkFileIsImage: function (file) {
        var module = 'checkFileIsImage';
        receivedLogger(module);

        return Promise.resolve(arguments)
            .then(function (args) {
                var errors = 0;

                //check that all args exist i.e. all fields are not null
                for (var i = 0, len = args.length; i < len; i++) {
                    if (errors === 0) {
                        if (!args[i]) {
                            errors++;
                            error('An error occurred. Some fields missing. Please try again');
                        }
                    }
                }

                //file type
                if (errors === 0) {
                    if (!(file.mimetype.indexOf('image') > -1)) {
                        ++errors;
                        error('Please upload a valid image file');
                    }
                }

                if (errors === 0) {
                    rq.consoleLogger(successLogger(module));
                    return true;
                }

                function error(errorMessage) {
                    return rq.functions().filesystem.deleteFile(file.path)
                        .catch(function (err) {
                            rq.rq.consoleLogger(errorLogger(module) + ": " + err.message + '\n' + err.stack);
                            return true;
                        })
                        .then(function () {
                            throw {
                                code: 500,
                                msg: errorMessage
                            };
                        });
                }
            });
    },


    validateNewPostCategory: function (theNewPostCategory) {
        var module = 'validateNewPostCategory';
        receivedLogger(module);

        return Promise.resolve(arguments)
            .then(function (args) {
                var errors = 0;

                //check that all args exist i.e. all fields are not null
                for (var i = 0, len = args.length; i < len; i++) {
                    if (errors === 0) {
                        if (!args[i]) {
                            errors++;
                            error('An error occurred. Some fields missing. Please try again');
                        }
                    }
                }

                //validate heading
                if (errors === 0) {
                    if ((theNewPostCategory.name === null || theNewPostCategory.name === undefined)) {
                        ++errors;
                        error('Missing name field');
                    }
                }

                //check that at least at least one character is non-whitespace
                if (errors === 0) {
                    if (!(noWhiteSpaceRegex.test(theNewPostCategory.name))) {
                        ++errors;
                        error('The category name does not seem to be right. Please check and try again');
                    }
                }


                if (errors === 0) {
                    if (theNewPostCategory.name.length === 0) {
                        ++errors;
                        error('The category name cannot be empty');
                    }
                }

                if (errors === 0) {
                    rq.post_category_db().checkIfCategoryNameExists(theNewPostCategory.name)
                        .then(function (status) {
                            if (status) {
                                //means name already exists
                                throw {
                                    err: new Error(errorLogger(module)),
                                    code: 600,
                                    msg: 'A category with the same name already exists'
                                };
                            } else {
                                return true;
                            }
                        });
                }

                function error(errorMessage) {
                    throw {
                        code: 400,
                        msg: errorMessage
                    };
                }
            });
    }
};