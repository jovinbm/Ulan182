var fileName = 'router_uber.js';

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
var cuid = require('cuid');

module.exports = {

    getPriceEstimate: function (req, res) {
        var app = require('../app.js').app();
        var module = 'getPriceEstimate';
        receivedLogger(module);

        var start_latitude = parseFloat(req.body.start_latitude).toFixed(10);
        var start_longitude = parseFloat(req.body.start_longitude).toFixed(10);
        var end_latitude = parseFloat(req.body.end_latitude).toFixed(10);
        var end_longitude = parseFloat(req.body.end_longitude).toFixed(10);

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([start_latitude, start_longitude, end_latitude, end_longitude]);
            })
            .then(function () {
                var options = {
                    url: 'estimates/price',
                    params: {
                        start_latitude: start_latitude,
                        start_longitude: start_longitude,
                        end_latitude: end_latitude,
                        end_longitude: end_longitude
                    }
                };
                return rq.functions().request.uberGet(options);
            })
            .then(function (arr) {
                var response = arr[0];
                var statusCode = arr[1];

                if (parseInt(statusCode) == 200 || parseInt(statusCode) == 201) {
                    rq.consoleLogger(successLogger(module));
                    res.status(200).send({
                        obj: response
                    })
                } else {
                    return rq.catchUberErrors(req, res, statusCode, response);
                }
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },

    getTimeEstimate: function (req, res) {
        var app = require('../app.js').app();
        var module = 'getTimeEstimate';
        receivedLogger(module);

        var start_latitude = parseFloat(req.body.start_latitude).toFixed(10);
        var start_longitude = parseFloat(req.body.start_longitude).toFixed(10);

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([start_latitude, start_longitude]);
            })
            .then(function () {
                var options = {
                    url: 'estimates/time',
                    params: {
                        start_latitude: start_latitude,
                        start_longitude: start_longitude
                    }
                };
                return rq.functions().request.uberGet(options);
            })
            .then(function (arr) {
                var response = arr[0];
                var statusCode = arr[1];

                if (parseInt(statusCode) == 200 || parseInt(statusCode) == 201) {
                    rq.consoleLogger(successLogger(module));
                    res.status(200).send({
                        obj: response
                    })
                } else {
                    return rq.catchUberErrors(req, res, statusCode, response);
                }
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },

    getRideStatus: function (req, res) {
        var app = require('../app.js').app();
        var module = 'getRideStatus';
        receivedLogger(module);

        var theUser = rq.getTheUser(req);

        var lastRide;

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([theUser]);
            })
            .then(function () {
                var query = new rq.Query();
                query.findQuery = {
                    userUniqueCuid: theUser.uniqueCuid,
                    active: true
                };
                query.lean = true;
                query.sort = {createdAt: -1};

                return rq.crud_db().find(rq.UberRide(), query, true)
                    .then(function (ride) {
                        /*
                         * will be null if not, can check for this on the client side
                         * */
                        lastRide = ride;
                        return true;
                    })
            })
            .then(function () {
                if (lastRide) {
                    var options = {
                        url: 'requests/' + lastRide.request_id,
                        params: {}
                    };
                    return rq.functions().request.uberGet(options, theUser.uber.access_token);
                } else {
                    return null;
                }
            })
            .then(function (arr) {
                var response = arr[0];
                var statusCode = arr[1];

                if (parseInt(statusCode) == 200 || parseInt(statusCode) == 201) {
                    rq.consoleLogger(successLogger(module));
                    res.status(200).send({
                        obj: response
                    })
                } else {
                    return rq.catchUberErrors(req, res, statusCode, response);
                }
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },

    getProducts: function (req, res) {
        var app = require('../app.js').app();
        var module = 'getProducts';
        receivedLogger(module);

        var latitude = parseFloat(req.body.latitude).toFixed(10);
        var longitude = parseFloat(req.body.longitude).toFixed(10);

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([latitude, longitude]);
            })
            .then(function () {
                var options = {
                    url: 'products',
                    params: {
                        latitude: latitude,
                        longitude: longitude
                    }
                };
                return rq.functions().request.uberGet(options);
            })
            .then(function (arr) {
                var response = arr[0];
                var statusCode = arr[1];

                if (statusCode == 200 || statusCode == 201) {
                    rq.consoleLogger(successLogger(module));
                    res.status(200).send({
                        obj: response
                    })
                } else {
                    return rq.catchUberErrors(req, res, statusCode, response);
                }
            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    },

    requestUber: function (req, res) {
        var app = require('../app.js').app();
        var module = 'requestUber';
        receivedLogger(module);

        var start_latitude = parseFloat(req.body.start_latitude).toFixed(10);
        var start_longitude = parseFloat(req.body.start_longitude).toFixed(10);
        var end_latitude = parseFloat(req.body.end_latitude).toFixed(10);
        var end_longitude = parseFloat(req.body.end_longitude).toFixed(10);
        var product_id = req.body.product_id;
        var theUser = rq.getTheUser(req);

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([start_latitude, start_longitude, end_latitude, end_longitude, product_id, theUser]);
            })
            .then(function () {
                /*
                 * check that there are no other active rides for this user
                 * */

                var query = new rq.Query();
                query.findQuery = {
                    active: true
                };

                return rq.crud_db().count(rq.UberRide(), query)
                    .then(function (total) {
                        if (total === 0) {
                            return true;
                        } else {
                            throw {
                                err: new Error(errorLogger(module, 'User trying to take multiple rides')),
                                code: 403,
                                msg: 'You still have an active ride, you cannot request another ride'
                            };
                        }
                    })
            })
            .then(function () {
                var options = {
                    url: 'requests',
                    params: {
                        start_latitude: start_latitude,
                        start_longitude: start_longitude,
                        end_latitude: end_latitude,
                        end_longitude: end_longitude,
                        product_id: product_id
                    }
                };
                return rq.functions().request.uberPost(options, theUser.uber.access_token);
            })
            .then(function (arr) {

                var response = arr[0];
                var statusCode = arr[1];

                var responseTemplate;

                return rq.catchRequestUberErrors(req, res, statusCode, response)
                    .then(function (rT) {

                        responseTemplate = rT;

                        if (statusCode == 200 || statusCode == 201) {
                            //save the uber ride'
                            var uberRide = new rq.UberRide()({
                                uniqueCuid: cuid(),
                                userUniqueCuid: theUser.uniqueCuid,
                                request_id: response.request_id,
                                startLatitude: start_latitude,
                                startLongitude: start_longitude,
                                endLatitude: end_latitude,
                                endLongitude: end_longitude,
                                active: true
                            });

                            return rq.crud_db().save(uberRide)
                                .then(function () {
                                    return response;
                                })
                        } else {
                            return null;
                            /* here we have not saved the ride*/
                        }

                    })
                    .then(function (response) {
                        rq.consoleLogger(successLogger(module));
                        responseTemplate.obj = response;
                        res.status(200).send(responseTemplate)
                    });

            })
            .catch(function (e) {
                rq.catchXhrErrors(req, res, e);
            });
    }
};