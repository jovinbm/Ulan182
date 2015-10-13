var fileName = 'router.js';
var Promise = require('bluebird');
var path = require('path');

module.exports = {

    user_api: function () {
        return require('./user_api.js');
    },

    account: function () {
        return require('./router_account.js');
    },

    error: function () {
        return require('./router_error.js');
    },

    indexHtml: function () {
        return require('./router_index.js');
    },

    user_profile: function () {
        return require('./router_user_profile.js');
    },

    twitter: function () {
        return require('./router_twitter.js');
    },

    uber: function () {
        return require('./router_uber.js');
    }
};