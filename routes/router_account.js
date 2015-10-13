var fileName = 'router_account.js';

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

function defaultMainObject(req, res) {

    return {
        title: 'The African Exponent - News and Articles Related to Africa',
        meta_description: '',
        theUser: req.user,
        state: '',
        partial: false,
        accountStatusBanner: rq.functions().account.returnAccountStatusBanner(req.user)
    };
}

module.exports = {

    render_create_account: function (req, res) {
        var module = 'render_create_account';
        receivedLogger(module);

        var main = defaultMainObject(req, res);
        main.title = 'Sign Up | UberP - The Ultimate Uber Planner';

        return Promise.resolve()
            .then(function () {
                res.render('all/create_account.hbs', main);
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    },

    render_account_login: function (req, res) {
        var module = 'render_account_login';
        receivedLogger(module);

        var main = defaultMainObject(req, res);
        main.title = 'Login | UberP - The Ultimate Uber Planner';
        main.customHeading = 'Experience The African Exponent Community';
        main.redirectToLastPage = false;

        return Promise.resolve()
            .then(function () {
                return res.render('all/sign_in.hbs', main);
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });
    },

    render_not_logged_in: function (req, res) {
        var module = 'render_not_logged_in';
        receivedLogger(module);

        var main = defaultMainObject(req, res);
        main.title = 'Not Logged In - UberP';
        main.customHeading = 'Please sign in to continue';
        main.redirectToLastPage = true;

        return Promise.resolve()
            .then(function () {
                return res.status(401).render('all/sign_in.hbs', main);
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e);
            });

    }

};