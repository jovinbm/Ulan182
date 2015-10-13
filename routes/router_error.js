var fileName = 'router_error.js';

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

var path = require('path');

function defaultMainObject(req, res) {

    return {
        title: 'The African Exponent - News and Articles Related to Africa',
        meta_description: '',
        theUser: req.user,
        state: '',
        partial: false,
        accountStatusBanner: rq.functions().account.returnAccountStatusBanner(req.user),
        postCategoryName: '',
        foundPostsIndexes: []
    };
}


module.exports = {

    render_friendly_html: function (req, res, errObj) {
        var rq = require('../rq.js');

        var main = {};

        main.errorObject = {
            msg: errObj.msg,
            errorCode: errObj.errorCode,
            partial: errObj.partial //must be a boolean
        };

        return Promise.resolve()
            .then(function () {
                //consoleLogger(successLogger(module));  //comment out to prevent papertrail from logging these keyword error

                main.err = {
                    info: 'ERROR', //--> triggers search keyword in papertrail
                    msg: main.errorObject.msg ? main.errorObject.msg : 'Not specified',
                    errorCode: main.errorObject.errorCode ? main.errorObject.errorCode : 'Not specified',
                    req: req.originalUrl,
                    status: 'Calling req.render of friendly e page. Failure will render the default e page'
                };

                rq.showErrorStack(main.err);
                return true;
            })
            .then(function () {
                return rq.routes().error().renderErrorPage(req, res, main.errorObject);
            });
    },

    renderErrorPage: function (req, res, errorObject) {
        var rq = require('../rq.js');
        var module = 'renderErrorPage';

        var main = defaultMainObject(req, res);
        main.title = 'The African Exponent';
        main.state = 'error';
        main.allPostCategoriesArray = [];
        main.allPostCategories = {};
        main.popularStories = [];

        main.errorObject = Object.keys(errorObject).length > 0 ? errorObject : {};
        main.errorCode = 200;

        if (errorObject.errorCode && parseInt(errorObject.errorCode)) {
            main.errorCode = errorObject.errorCode;
        }

        if (errorObject.partial) {
            main.partial = true;
        } else {
            main.partial = false;
        }


        return Promise.resolve()
            .then(function () {
                return rq.post_category_handler().getPostCategories(null, null);
            })
            .then(function (obj) {
                main.allPostCategoriesArray = obj.postCategoriesArray;

                //put post categories
                main.allPostCategoriesArray.forEach(function (category) {
                    main.allPostCategories[category.postCategoryUniqueCuid] = category.postCategoryName;
                });

                var options = {
                    quantity: 20,
                    maxIterations: 30,
                    quantityInPerIteration: 1,
                    intervalInDaysForEachIteration: 1,
                    intervalInDays: 21,
                    excludedPostIndexes: main.foundPostsIndexes
                };

                return rq.post_handler().getPopularStories(options);
            })
            .then(function (obj) {
                main.popularStories = obj.popularStories;
                return true;
            })
            .then(function () {
                res.status(main.errorCode).render('all/errorPage.ejs', main);
            })
            .catch(function (e) {
                rq.showErrorStack(e);
                rq.routes().error().render_error_500(req, res); // this is a permanent error, just render the error 500;
            });
    },

    render_error_500: function (req, res) {
        var module = 'render_error_500';
        receivedLogger(module);

        var main = defaultMainObject(req, res);
        main.title = 'An error occurred - The African Exponent';

        res.status(500).render('error/error500.ejs', main);
    }

};