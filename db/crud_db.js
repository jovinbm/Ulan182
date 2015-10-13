var fileName = 'crud.js';

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


module.exports = {

    save: function (mongooseObj) {
        var module = 'save';
        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([
                    mongooseObj,
                    mongooseObj ? _.isFunction(mongooseObj.save) : null
                ]);
            })
            .then(function () {
                return mongooseObj.saveAsync()
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    })
                    .spread(function (obj) {
                        return obj;
                    });
            })
            .catch(rq.catchExcessErrors);
    },

    find: function (model, options, findOne) {
        var module = 'find';

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([
                    model,
                    model ? _.isFunction(model.find) : null,
                    model ? _.isFunction(model.findOne) : null,
                    options,
                    options ? _.isObject(options) : null
                ]);
            })
            .then(function () { //check sort
                if (!_.isObject(options.sort)) {
                    return true;
                } else {
                    var errors = 0;
                    _.mapObject(options.sort, function (val, key) {
                        if (val != 1 && val != -1) {
                            errors++;
                        }
                    });
                    if (errors > 0) {
                        throw {
                            err: new Error(errorLogger(module, 'Sort can either be 1 or -1')),
                            code: 500
                        };
                    } else {
                        return true;
                    }
                }
            })
            .then(function () { //check skip
                if (!_.isNumber(options.skip) && options.skip !== null) {
                    //means the user provided a wrong skip value, shout!
                    throw {
                        err: new Error(errorLogger(module, 'Skip value has to be a number')),
                        code: 500
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                var findQuery = options.findQuery || {};
                var returnQuery = options.returnQuery || null;

                var p;
                if (findOne) {
                    p = model.findOne(findQuery, returnQuery); //returns an object directly, null for not found
                } else {
                    p = model.find(findQuery, returnQuery);  //returns an array, [] for not found
                }

                p = options.sort ? p.sort(options.sort) : p;
                p = options.skip ? p.skip(options.skip) : p;
                p = options.limit ? p.limit(options.limit) : p;
                p = options.lean ? p.lean() : p;

                return p.execAsync()
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    });
            })
            .then(function (arr) {
                return arr;
            })
            .catch(rq.catchExcessErrors);
    },

    update: function (model, options) {
        var module = 'update';

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([
                    model,
                    model ? _.isFunction(model.update) : null,
                    options,
                    options ? _.isObject(options) : null
                ]);
            })
            .then(function () {
                var findQuery = options.findQuery || {};
                var updateQuery = options.updateQuery || {};

                return model.update(findQuery, updateQuery, {
                    upsert: false,
                    multi: true
                }).execAsync()
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    });
            })
            .catch(rq.catchExcessErrors);
    },

    count: function (model, options) {
        var module = 'count';

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([
                    model,
                    model ? _.isFunction(model.count) : null,
                    options,
                    options ? _.isObject(options) : null
                ]);
            })
            .then(function () {
                var findQuery = options.findQuery || {};

                return model.count(findQuery)
                    .execAsync()
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    })
                    .then(function (total) {
                        return total;
                    });
            })
            .catch(rq.catchExcessErrors);
    },

    remove: function (model, options) {
        var module = 'remove';

        return Promise.resolve()
            .then(function () {
                return rq.catchEmptyArgs([
                    model,
                    model ? _.isFunction(model.remove) : null,
                    options,
                    options ? _.isObject(options) : null
                ]);
            })
            .then(function () {
                var findQuery = options.findQuery || {};

                return model.remove(findQuery)
                    .execAsync()
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    })
                    .then(function () {
                        return true;
                    });
            })
            .catch(rq.catchExcessErrors);
    }
};