module.exports = function (app, rq) {
    var Promise = require('bluebird');
    var passport = require('passport');
    var routes = rq.routes();
    var functions = rq.functions();
    var middleware = functions.middleware;

    app.get('/', function (req, res) {
        return Promise.resolve()
            .then(function () {
                throw {
                    code: 301,
                    redirectPath: '/index.app'
                };
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    });
    app.get('/index.app', middleware.addLastPage, routes.indexHtml().render_index_Html);

    app.get('/pr/profile/:username', middleware.useHttps, middleware.addLastPage, middleware.ensureAuthenticated, middleware.addUserData, routes.user_profile().render_user_private_profile_Html);
    app.get('/profile/:username', middleware.useHttp, middleware.addLastPage, routes.user_profile().render_user_public_profile_Html);

    /*errors*/
    app.get('/pageNotFound', middleware.useHttp, function (req, res) {
        return Promise.resolve()
            .then(function () {
                throw {
                    code: 404
                };
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    });
    app.get('/notAuthorizedPage', middleware.useHttp, function (req, res) {
        return Promise.resolve()
            .then(function () {
                throw {
                    code: 403
                };
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    });

    app.post('/api/updateUserDetails', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.user_api().updateUserDetails);
    app.post('/api/updateUserPassword', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.user_api().updateUserPassword);
    app.post('/api/updateUserFacebook', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.user_api().updateUserFacebook);
    app.post('/api/deleteConnectedService', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.user_api().deleteConnectedService);

    app.get('/auth/twitter', middleware.ensureAuthenticatedXhr, middleware.addUserData, passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', middleware.ensureAuthenticatedXhr, middleware.addUserData, routes.twitter().connectToTwitter);

};