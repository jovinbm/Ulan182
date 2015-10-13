var fileName = 'page_redis.js';

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

    saveHomePageData: function (data) {
        var app = rq.app();
        var redis_setter = rq.db_redis().redis_setter;
        var module = 'saveHomePageData';
        receivedLogger(module);


        if (data) {

            var key = "homepage:data";

            var options = {
                keyName: key,
                data: JSON.stringify(data),
                expire: {
                    expires: true,
                    seconds: app.locals.getExpirationSecs(key)
                }
            };

            return redis_setter.setKey(options)
                .then(function () {
                    rq.consoleLogger(successLogger(module));
                    return true;
                });

        } else {
            throw {
                code: 500,
                err: new Error(errorLogger(module, 'data = ' + data))
            };
        }
    },

    getHomePageData: function () {
        var app = rq.app();
        var redis_getter = rq.db_redis().redis_getter;
        var module = 'getHomePageData';
        receivedLogger(module);

        var key = "homepage:data";

        var options = {
            keyName: key,
            expire: {
                expires: true,
                seconds: app.locals.getExpirationSecs(key)
            }
        };

        return redis_getter.getKey(options)
            .then(JSON.parse)
            .then(function (data) {
                return data;
            });
    },

    savePostPageData: function (data) {
        var app = rq.app();
        var redis_setter = rq.db_redis().redis_setter;
        var module = 'savePostPageData';
        receivedLogger(module);

        if (data) {

            var hashKey = 'postPages';
            var key = data.postIndex;

            var options = {
                hashKey: hashKey,
                keyName: key,
                data: JSON.stringify(data),
                expire: {
                    expires: true,
                    seconds: app.locals.getExpirationSecs(hashKey)
                }
            };

            return redis_setter.setHashKey(options)
                .then(function () {
                    rq.consoleLogger(successLogger(module));
                    return true;
                });

        } else {
            throw {
                code: 500,
                err: new Error(errorLogger(module, 'data = ' + data))
            };
        }
    },

    getPostPageData: function (postIndex) {
        var app = rq.app();
        var redis_getter = rq.db_redis().redis_getter;
        var module = 'getPostPageData';
        receivedLogger(module);

        if (postIndex) {
            var hashKey = 'postPages';
            var key = parseInt(postIndex);

            var options = {
                hashKey: hashKey,
                keyName: key,
                expire: {
                    expires: true,
                    seconds: app.locals.getExpirationSecs(hashKey)
                }
            };

            return redis_getter.getKeyInHash(options)
                .then(JSON.parse)
                .then(function (data) {
                    return data;
                });

        } else {
            throw {
                code: 500,
                err: new Error(errorLogger(module, 'postIndex = ' + postIndex))
            };
        }
    },


    savePostCategoryPageData: function (obj) {
        var app = rq.app();
        var redis_setter = rq.db_redis().redis_setter;
        var module = 'savePostCategoryPageData';
        receivedLogger(module);

        var data = obj.data;
        var postCategoryUniqueCuid = obj.postCategoryUniqueCuid;
        var page = parseInt(obj.page);

        if (data && postCategoryUniqueCuid && page) {

            var hashKey = 'postCategoryPages';
            var keyName = postCategoryUniqueCuid + ':' + page;

            var options = {
                hashKey: hashKey,
                keyName: keyName,
                data: JSON.stringify(data),
                expire: {
                    expires: true,
                    seconds: app.locals.getExpirationSecs(hashKey)
                }
            };

            return redis_setter.setHashKey(options)
                .then(function () {
                    rq.consoleLogger(successLogger(module));
                    return true;
                });

        } else {
            throw {
                code: 500,
                err: new Error(errorLogger(module, 'Some arguments are invalid'))
            };
        }
    },

    getPostCategoryPageData: function (obj) {
        var app = rq.app();
        var redis_getter = rq.db_redis().redis_getter;
        var module = 'getPostCategoryPageData';
        receivedLogger(module);

        var postCategoryUniqueCuid = obj.postCategoryUniqueCuid;
        var page = parseInt(obj.page);

        if (postCategoryUniqueCuid && page) {
            var hashKey = 'postCategoryPages';
            var keyName = postCategoryUniqueCuid + ':' + page;

            var options = {
                hashKey: hashKey,
                keyName: keyName,
                expire: {
                    expires: true,
                    seconds: app.locals.getExpirationSecs(hashKey)
                }
            };

            return redis_getter.getKeyInHash(options)
                .then(JSON.parse)
                .then(function (data) {
                    return data;
                });

        } else {
            throw {
                code: 500,
                err: new Error(errorLogger(module, 'Some arguments are invalid'))
            };
        }
    }
};