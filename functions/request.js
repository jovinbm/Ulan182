var fileName = 'request.js';

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

var request = Promise.promisifyAll(require("request"));
var quesryString = require('queryString');

module.exports = {

    get: function (options) {
        var module = 'get';
        receivedLogger(module);

        /*
         * options should be of the following format
         * {
         * url:url, -> required, others optional
         * oauth:oauth,
         * qs:qs,
         * json:true}*/

        return Promise.resolve()
            .then(function () {
                if (!options.url) {
                    throw {
                        msg: 'options.url = ' + options.url,
                        code: 500
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return request.getAsync(options)
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    })
                    .spread(function (response, body) {
                        return [body, response.statusCode];
                    });
            });
    },

    post: function (options) {
        /*
         * options should be of the following format
         * {
         * url:'http://service.com/upload',
         * form: {key:'value'} -> if data is form
         * json: {key:'value'} -> if data is obj**
         * }*/

        /*if headers not present in options, request sets headers to application/x-www-form-urlencoded*/

        var module = 'post';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (!options.url) {
                    throw {
                        msg: 'options.url = ' + options.url,
                        code: 500
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                return request.postAsync(options)
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    })
                    .spread(function (response, body) {
                        return [body, response.statusCode];
                    });
            });
    },

    put: function (options) {
        /*
         * options should be of the following format
         * {
         * url:'http://service.com/upload',
         * form: {key:'value'} -> if data is form
         * json: {key:'value'} -> if data is obj**
         * }*/

        /*if headers not present in options, request sets headers to application/x-www-form-urlencoded*/

        var module = 'put';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (!options.url) {
                    throw {
                        msg: 'options.url = ' + options.url,
                        code: 500
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                return request.putAsync(options)
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    })
                    .spread(function (response, body) {
                        return [body, response.statusCode];
                    });
            });
    },

    uberGet: function (options, accessToken) {

        //the accessToken is for the user, no need to provide server token, as it is used by default

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([options.params, options.url]);
            })
            .then(function () {

                var baseURL = 'https://sandbox-api.uber.com/';

                var url = baseURL + 'v1' + '/' + options.url + '?';

                /*
                 * if no user access token is provided, the server token is used
                 * */
                if (!accessToken) {
                    accessToken = rq.uberDetails.server_token;
                    url += 'server_token=' + rq.uberDetails.server_token;
                } else {
                    url += 'access_token=' + accessToken;
                }

                url += '&' + quesryString.stringify(options.params);

                return {
                    url: url,
                    json: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + accessToken
                    },
                    body: options.params
                };
            })
            .then(function (params) {
                return rq.functions().request.get(params);
            })
            .then(function (array) {
                var body = array[0];
                var statusCode = array[1];

                return [body, statusCode];
            })

    },

    uberPost: function (options, accessToken) {

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([options.params, options.url, accessToken]);
            })
            .then(function () {

                var baseURL = 'https://sandbox-api.uber.com/';

                var url = baseURL + 'v1' + '/' + options.url + '?';

                return {
                    url: url,
                    json: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + accessToken
                    },
                    body: options.params
                };
            })
            .then(function (params) {
                return rq.functions().request.post(params);
            })
            .then(function (array) {
                var body = array[0];
                var statusCode = array[1];

                return [body, statusCode];
            })

    },

    uberPut: function (options, accessToken) {

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([options.params, options.url, accessToken]);
            })
            .then(function () {

                var baseURL = 'https://sandbox-api.uber.com/';

                var url = baseURL + 'v1' + '/' + options.url + '?';

                return {
                    url: url,
                    json: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + accessToken
                    },
                    body: options.params
                };
            })
            .then(function (params) {
                return rq.functions().request.put(params);
            })
            .then(function (array) {
                var body = array[0];
                var statusCode = array[1];

                return [body, statusCode];
            })

    },


    getUserFacebookLongLivedToken: function (shortLivedToken) {
        var app = rq.app();
        var module = 'getUserFacebookLongLivedToken';
        receivedLogger(module);

        return Promise.resolve()
            .then(function () {
                if (!shortLivedToken) {
                    throw {
                        msg: 'shortLivedToken = ' + shortLivedToken,
                        code: 500
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                var client_id = process.env.facebookAppId;
                var client_secret = process.env.facebookAppSecret;
                var fb_exchange_token = shortLivedToken;

                var url;

                return Promise.resolve()
                    .then(function () {
                        if (!client_id || !client_secret || !fb_exchange_token) {
                            throw {
                                msg: 'Critical data missing for retrieving user token',
                                code: 500
                            };
                        } else {
                            return true;
                        }
                    })
                    .then(function () {
                        url = 'https://graph.facebook.com/oauth/access_token?' +
                            'grant_type=fb_exchange_token&' +
                            'client_id=' + client_id + '& ' +
                            'client_secret=' + client_secret + '&' +
                            'fb_exchange_token=' + fb_exchange_token;

                        return true;
                    })
                    .then(function () {

                        var options = {
                            url: url,
                            json: true
                        };

                        return rq.functions().request.get(options)
                            .catch(function () {
                                throw {
                                    msg: 'We could not connect your account to facebook. Please check to make sure that The African Exponent has permissions to access your public profile.',
                                    code: 400
                                };
                            })
                            .then(function (body) {
                                return {
                                    accessToken: app.locals.trimString(body, 'access_token=', '&'),
                                    expiresIn: parseInt(app.locals.trimString(body, 'expires=', '&'))
                                };
                            });
                    });
            });
    }


};
