module.exports = function (app) {

    //a means of checks and balances to make sure
    //we can track every key
    //keys include string keys, hashes, sets etc
    app.locals.allRedisKeys = [
        "homepage:data", //string key
        "postPages", //a hash of cached posts (keys being their postIndexes)
        "postCategoryPages", //a hash (keys are postCategoryUniqueCuids)
        "postCategories" //key containing post categories
    ];

    app.locals.checkIfRedisKeyIsRegistered = function (keyName) {
        return app.locals.allRedisKeys.indexOf(keyName) > -1;
    };

    app.locals.keysToBeDeleted = { //NOTE that these keys are vulnerable for deletion when the posts change
        "homepage:data": true,
        "postPages": true,
        "postCategoryPages": true,
        "postCategories": true
    };

    app.locals.keysExpirationSecs = {
        "homepage:data": 10800, //3 hrs
        "postPages": 10800, //3 hrs
        "postCategoryPages": 10800, //3 hrs
        "postCategories": 86400 //24hrs
    };

    app.locals.getExpirationSecs = function (keyName) {
        if (app.locals.keysExpirationSecs.hasOwnProperty(keyName)) {
            return app.locals.keysExpirationSecs[keyName];
        } else {
            return false;
        }
    };

    app.locals.checkIfRedisKeyIsValid = function (keyName) { //valid in that maybe a restart was done and it was not valid anymore
        if (app.locals.keysToBeDeleted.hasOwnProperty(keyName)) {
            return app.locals.keysToBeDeleted[keyName] === false;
        } else {
            return true;
        }
    };

    app.locals.redisKeyIsReplaced = function (keyName) {
        if (app.locals.keysToBeDeleted.hasOwnProperty(keyName)) {
            app.locals.keysToBeDeleted[keyName] = false;
        }
    };

    app.locals.getHashExpireKey = function (hashKey, keyName) {
        return hashKey.toString() + ':' + keyName.toString();
    };

};