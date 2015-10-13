var fileName = 'redis_getter.js';

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

    getKey: function (obj) {
        var app = rq.app();
        var delete_redis = rq.db_redis().delete_redis;
        var redisClient = require('../app.js').redisClient();
        var module = 'getKey';
        receivedLogger(module);

        var keyName = obj.keyName;

        return Promise.resolve()
            .then(function () {
                if (keyName) {
                    return true;
                } else {
                    throw {
                        code: 500,
                        err: new Error(errorLogger(module, 'keyName not supplied'))
                    };
                }
            })
            .then(function () {
                //check if key is registered in app.locals.allRedisKeys
                if (app.locals.checkIfRedisKeyIsRegistered(keyName)) {
                    return true;
                } else {
                    throw {
                        code: 500,
                        err: new Error(errorLogger(module, 'keyName is not registered in app.locals'))
                    };
                }
            })
            .then(function () {
                //check if the key is valid for retrieving
                if (app.locals.checkIfRedisKeyIsValid(keyName)) {
                    return redisClient.getAsync(keyName)
                        .then(function (data) {
                            rq.consoleLogger(successLogger(module, 'successfully retrieved ' + keyName + ' from cache'));
                            return data;
                        })
                        .catch(function (err) {
                            throw {
                                err: new Error(errorLogger(module, err)),
                                code: 500
                            };
                        });
                } else {
                    //delete the invalid key
                    return delete_redis.deleteKey(keyName)
                        .then(function () {
                            rq.consoleLogger(successLogger(module, keyName + ' not retrieved from cache'));
                            return null;
                        });
                }
            })
            .then(function (data) {
                return data;
            })
            .catch(function (e) {
                var f = new Error(errorLogger(module, 'Error retrieving data from redis', e));
                rq.showErrorStack(f);
                return null;
            });
    },

    getKeyInHash: function (obj) {
        var app = rq.app();
        var delete_redis = rq.db_redis().delete_redis;
        var redisClient = require('../app.js').redisClient();
        var module = 'getKeyInHash';
        receivedLogger(module);

        var hashKey = obj.hashKey;
        var keyName = obj.keyName;
        var expires = obj.expire.expires; //boolean, used to check for the expire representative key of the hash key

        var fullKey = app.locals.getHashExpireKey(hashKey, keyName); //hash+key

        return Promise.resolve()
            .then(function () {
                if (hashKey && keyName) {
                    return true;
                } else {
                    throw {
                        code: 500,
                        err: new Error(errorLogger(module, 'hashKey || keyName not supplied'))
                    };
                }
            })
            .then(function () {
                //check if hashName is registered in app.locals.allRedisKeys
                if (app.locals.checkIfRedisKeyIsRegistered(hashKey)) {
                    return true;
                } else {
                    throw {
                        code: 500,
                        err: new Error(errorLogger(module, 'hashKey is not registered in app.locals'))
                    };
                }
            })
            .then(function () {
                //check if the key is valid for retrieving
                if (app.locals.checkIfRedisKeyIsValid(hashKey)) {
                    return true;
                } else {
                    //delete the invalid hash
                    return delete_redis.deleteKey(hashKey)
                        .then(function () {
                            throw{
                                code: 'not-valid'
                            };
                        });
                }
            })
            .then(function () {
                if (expires) {
                    //check that it has not expired yet
                    return redisClient.existsAsync(fullKey)
                        .catch(function (e) {
                            throw {
                                code: 500,
                                err: new Error(errorLogger(module, e))
                            };
                        })
                        .then(function (val) {
                            if (val) {
                                return true;
                            } else {
                                //remove the key from the hash
                                return delete_redis.deleteHashKey(hashKey, keyName)
                                    .then(function () {
                                        throw {
                                            code: 'expired'
                                        };
                                    });
                            }

                        });
                }
            })
            .then(function () {
                //get the hash key
                return redisClient.hgetAsync(hashKey, keyName)
                    .then(function (data) {
                        rq.consoleLogger(successLogger(module, 'successfully retrieved ' + fullKey + ' from cache'));
                        return data;
                    })
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    });
            })
            .then(function (data) {
                return data;
            })
            .catch(function (e) {
                if (e.code == 'not-valid') {
                    //the key was not valid for retrieval
                    rq.consoleLogger(successLogger(module, fullKey + ' not retrieved from cache'));
                    return null;
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                if (e.code == 'expired') {
                    //the key was not valid for retrieval
                    rq.consoleLogger(successLogger(module, fullKey + ' expired: not retrieved from cache'));
                    return null;
                } else {
                    throw e;
                }
            })
            .catch(function (e) {
                var f = new Error(errorLogger(module, 'Error retrieving data from redis', e));
                rq.showErrorStack(f);
                return null;
            });
    }
};