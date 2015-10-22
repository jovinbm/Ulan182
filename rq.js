var Promise = require('bluebird');
var path = require('path');

var Uber = require('node-uber');
var uberDetails = {
    sandbox: true,
    client_id: process.env.uberClientId,
    client_secret: process.env.uberClientSecret,
    server_token: process.env.uberServerToken,
    //redirect_uri: process.env.NODE_ENV == 'production' ? 'https://www.pluschat.net/api/uberauth/callback' : 'http://localhost:7000/api/uberauth/callback',
    redirect_uri: 'http://localhost/callback',
    name: 'ubLan'
};

console.log(uberDetails.redirect_uri);

var uber = new Uber(uberDetails);

module.exports = {

    uber: uber,

    uberDetails: uberDetails,

    app: function () {
        return require('./app.js').app();
    },

    cons: function () {
        return require('consolidate');
    },

    database: function () {
        return require('./database/database.js');
    },

    User: function () {
        return require('./database/database.js').User;
    },

    UberRide: function () {
        return require('./database/database.js').UberRide;
    },

    Query: function Query(findQuery, updateQuery, returnQuery, lean, sort, limit, skip) {
        this.findQuery = findQuery || {};
        this.updateQuery = updateQuery || {};
        this.returnQuery = returnQuery || null;
        this.lean = lean || null;
        this.sort = sort || null;
        this.limit = limit || null;
        this.skip = skip || null;
    },

    db: function () {
        return require('./db/db.js');
    },

    crud_db: function () {
        return require('./db/db.js').crud_db;
    },

    user_db: function () {
        return require('./db/db.js').user_db;
    },

    db_redis: function () {
        return require('./db_redis/redis.js');
    },

    routes: function () {
        return require('./routes/router.js');
    },

    endPoints: function () {
        return require('./endpoints/endPoints.js');
    },

    functions: function () {
        return require('./functions/functions.js');
    },

    catchExcessErrors: function (e) {
        return require('./rq').functions().error.catchExcessErrors(e);
    },

    catchXhrErrors: function (req, res, e) {
        return require('./rq').functions().error.catchXhrErrors(req, res, e);
    },

    catchNonXhrErrors: function (req, res, e, isPartial) {
        return require('./rq').functions().error.catchNonXhrErrors(req, res, e, isPartial);
    },

    showErrorStack: function (err) {
        return require('./rq').functions().error.showErrorStack(err);
    },

    catchEmptyArgs: function (arrOfArguments) {
        return require('./rq').functions().error.catchEmptyArgs(arrOfArguments);
    },

    catchUberErrors: function (req, res, statusCode, body) {
        return require('./rq').functions().error.catchUberErrors(req, res, statusCode, body);
    },

    catchRequestUberErrors: function (req, res, statusCode, body) {
        return require('./rq').functions().error.catchRequestUberErrors(req, res, statusCode, body);
    },

    consoleLogger: function (data) {
        return require('./functions/functions.js').basic.consoleLogger(data);
    },

    receivedLogger: function (module, fileName) {
        var rL = require('./rq').functions().basic.receivedLogger;
        return rL(fileName, module);
    },

    successLogger: function (module, fileName, text) {
        var sL = require('./rq').functions().basic.successLogger;
        return sL(fileName, module, text);
    },

    errorLogger: function (module, fileName, text, err) {
        var eL = require('./rq').functions().basic.errorLogger;
        return eL(fileName, module, text, err);
    },

    getTheUser: function (req) {
        return require('./rq').functions().basic.getTheUser(req);
    }
};