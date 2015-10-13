var fileName = 'delete_redis.js';

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

    flushAllDB: function () {
        var redisClient = require('../app.js').redisClient();
        var module = 'flushAllDB';

        return redisClient.flushdbAsync()
            .then(function (data) {
                rq.consoleLogger(successLogger(module, 'Successfully deleted all keys in redis database'));
                return data;
            })
            .catch(function (err) {
                throw {
                    err: new Error(errorLogger(module, err)),
                    code: 500
                };
            });
    },

    deleteKey: function (keyName) {
        var redisClient = require('../app.js').redisClient();
        var module = 'deleteKey';

        return Promise.resolve()
            .then(function () {
                if (!keyName) {
                    throw {
                        err: new Error(errorLogger(module, 'invalid key name, keyName = ' + keyName)),
                        code: 500
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                return redisClient.delAsync(keyName)
                    .catch(function (e) {
                        throw {
                            code: 500,
                            err: new Error(errorLogger(module, e))
                        };
                    });
            });
    },

    deleteHashKey: function (hashName, keyName) {
        var redisClient = require('../app.js').redisClient();
        var module = 'deleteHashKey';

        return Promise.resolve()
            .then(function () {
                if (!keyName) {
                    throw {
                        err: new Error(errorLogger(module, 'invalid key name, keyName = ' + keyName)),
                        code: 500
                    };
                } else if (!hashName) {
                    throw {
                        err: new Error(errorLogger(module, 'invalid hash name, hashName = ' + hashName)),
                        code: 500
                    };
                } else {
                    return true;
                }
            })
            .then(function () {
                return redisClient.hdelAsync(hashName, keyName)
                    .catch(function (e) {
                        throw {
                            code: 500,
                            err: new Error(errorLogger(module, e))
                        };
                    });
            });
    },

    initiatePostChanges: function () {
        var app = rq.app();
        var redisClient = require('../app.js').redisClient();
        var module = 'initiatePostChanges';

        //get the dynamic keys from app.locals.keysToBeDeleted
        var dynamicKeys = [];
        for (var key in app.locals.keysToBeDeleted) {
            if (app.locals.keysToBeDeleted.hasOwnProperty(key)) {
                dynamicKeys.push(key);
            }
        }

        return redisClient.delAsync(dynamicKeys)
            .catch(function (err) {
                throw {
                    err: new Error(errorLogger(module, err)),
                    code: 500
                };
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return true;
            });
    },

    initiateMultiplePostsChanges: function () {
        var app = rq.app();
        var redisClient = require('../app.js').redisClient();
        var module = 'initiateMultiplePostsChanges';

        //get the dynamic keys from app.locals.keysToBeDeleted
        var dynamicKeys = [];
        for (var key in app.locals.keysToBeDeleted) {
            if (app.locals.keysToBeDeleted.hasOwnProperty(key)) {
                dynamicKeys.push(key);
            }
        }

        return redisClient.delAsync(dynamicKeys)
            .catch(function (err) {
                throw {
                    err: new Error(errorLogger(module, err)),
                    code: 500
                };
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return true;
            });
    }
};