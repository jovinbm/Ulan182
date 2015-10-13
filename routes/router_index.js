var fileName = 'router_index.js';
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
        title: 'UberLAN - The Ultimate Uber Trip Planner',
        meta_description: '',
        theUser: req.user,
        state: '',
        partial: false,
        accountStatusBanner: rq.functions().account.returnAccountStatusBanner(req.user)
    };
}
module.exports = {

    render_index_Html: function (req, res) {
        require('./router.js').indexHtml().renderIndexHtml(req, res);
    },


    renderIndexHtml: function (req, res) {
        var rq = require('../rq.js');
        var module = 'renderIndexHtml';
        receivedLogger(module);

        var main = defaultMainObject(req, res);
        main.title = 'UberLAN - The Ultimate Uber Trip Planner';
        main.state = 'index';

        return Promise.resolve()
            .then(function () {
                rq.consoleLogger(successLogger(module));
                return res.status(200).render('all/index.hbs', main);
            })
            .catch(function (e) {
                rq.catchNonXhrErrors(req, res, e, rq);
                return true;
            });
    }
};