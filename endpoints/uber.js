module.exports = function (app, rq) {
    var Promise = require('bluebird');
    var passport = require('passport');
    var routes = rq.routes();
    var functions = rq.functions();
    var middleware = functions.middleware;

    app.post('/api/getPriceEstimate', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.uber().getPriceEstimate);
    app.post('/api/getTimeEstimate', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.uber().getTimeEstimate);
    app.post('/api/getProducts', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.uber().getProducts);
    app.post('/api/requestUber', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.uber().requestUber);
    app.post('/api/getRideStatus', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.uber().getRideStatus);
    app.post('/api/updateUberRequestSandbox', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.uber().updateUberRequestSandbox);

};