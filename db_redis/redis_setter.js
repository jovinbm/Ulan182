var fileName = 'redis_setter.js';

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

//these functions set keys into the redis database

module.exports = {

    setKey: function (obj) {
        var app = rq.app();
        var redisClient = require('../app.js').redisClient();
        var module = 'setKey';
        receivedLogger(module);

        var keyName = obj.keyName;
        var data = obj.data; //DATA MUST BE A STRING
        var expires = obj.expire.expires; //should be a boolean

        var timeOptions = {
            milliseconds: obj.expire.milliseconds,
            seconds: obj.expire.seconds,
            minutes: obj.expire.minutes,
            hours: obj.expire.hours,
            days: obj.expire.days,
            months: obj.expire.months,
            years: obj.expire.years,

            returnFormat: 'seconds' //add the return format for redis expire
        };

        var secs;

        return Promise.resolve()
            .then(function () {
                if (keyName && data) {
                    return true;
                } else {
                    throw {
                        code: 500,
                        err: new Error(errorLogger(module, 'keyName || data not supplied'))
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
                if (expires) {
                    return rq.functions().datesFn.getTimeInFormat(timeOptions);
                } else {
                    throw {
                        code: 'no-expire'
                    };
                }
            })
            .then(function (timeInCorrectFormat) {
                secs = timeInCorrectFormat;
                return true;
            })
            .catch(function (err) {
                if (err.code == 'no-expire') {
                    return true;
                } else {
                    throw err;
                }
            })
            .then(function () {
                return redisClient.setAsync(keyName, data)
                    .then(function () {
                        if (expires) {
                            return redisClient.expireAsync(keyName, secs)
                                .then(function () {
                                    return true;
                                });
                        } else {
                            return true;
                        }
                    })
                    .then(function () {
                        //if this key is available on the delete to restart thing, set it to false
                        //true means that they are not yet replaced
                        app.locals.redisKeyIsReplaced(keyName);
                        return true;
                    })
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    });
            })
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return true;
            })
            .catch(function (e) {
                var f = new Error(errorLogger(module, 'Error retrieving data from redis', e));
                rq.showErrorStack(f);
                return null;
            });
    },

    setHashKey: function (obj) {
        //!!!hashes use different individual keys to keep track of expiration if need be!!!
        var app = rq.app();
        var redisClient = require('../app.js').redisClient();
        var module = 'setHashKey';
        receivedLogger(module);

        var hashKey = obj.hashKey;
        var keyName = obj.keyName;
        var data = obj.data;//DATA MUST BE A STRING
        var expires = obj.expire.expires; //should be a boolean

        var fullKey = app.locals.getHashExpireKey(hashKey, keyName); //hash+key

        var timeOptions = {
            milliseconds: obj.expire.milliseconds,
            seconds: obj.expire.seconds,
            minutes: obj.expire.minutes,
            hours: obj.expire.hours,
            days: obj.expire.days,
            months: obj.expire.months,
            years: obj.expire.years,

            returnFormat: 'seconds' //add the return format for redis expire
        };

        var secs;

        return Promise.resolve()
            .then(function () {
                if (hashKey && keyName && data) {
                    return true;
                } else {
                    throw {
                        code: 500,
                        err: new Error(errorLogger(module, 'hashKey || keyName || data not supplied'))
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
                if (expires) {
                    return rq.functions().datesFn.getTimeInFormat(timeOptions);
                } else {
                    throw {
                        code: 'no-expire'
                    };
                }
            })
            .then(function (timeInCorrectFormat) {
                secs = timeInCorrectFormat;
                return true;
            })
            .catch(function (err) {
                if (err.code == 'no-expire') {
                    return true;
                } else {
                    throw err;
                }
            })
            .then(function () {
                return redisClient.hsetAsync(hashKey, keyName, data)
                    .then(function () {
                        if (expires) {
                            //set another key equivalent to hashKey+keyName and set expire on that
                            var expireKey = fullKey;

                            if (expireKey) {
                                return redisClient.setexAsync(expireKey, secs, 'expire_object')
                                    .then(function () {
                                        rq.consoleLogger(successLogger(module, 'Successfully saved ' + fullKey + ' to cache'));
                                        return true;
                                    });
                            } else {
                                throw {
                                    code: 500,
                                    err: new Error(errorLogger(module, 'invalid expireKey: expireKey = ' + expireKey))
                                };
                            }
                        } else {
                            rq.consoleLogger(successLogger(module, 'Successfully saved ' + fullKey + ' to cache'));
                            return true;
                        }
                    })
                    .then(function () {
                        //if this key is available on the delete to restart thing, set it to false
                        //true means that they are not yet replaced
                        app.locals.redisKeyIsReplaced(hashKey);
                        return true;
                    })
                    .catch(function (err) {
                        throw {
                            err: new Error(errorLogger(module, err)),
                            code: 500
                        };
                    });
            })
            .then(function () {
                return true;
            })
            .catch(function (e) {
                var f = new Error(errorLogger(module, 'Error retrieving data from redis', e));
                rq.showErrorStack(f);
                return null;
            });
    }
};