module.exports = function (app, rq) {
    var Promise = require('bluebird');
    var routes = rq.routes();
    var functions = rq.functions();
    var showErrorStack = functions.error.showErrorStack;

//error handlers
    function logErrors(err, req, res, next) {
        showErrorStack(err);
        next(err);
    }

    function resolveUploadErrors(err, req, res, next) {
        if (err.customStatus == 'upload') {
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'warning',
                msg: 'An error has occurred. Please try again'
            });
        } else {
            next(err);
        }
    }

    function clientErrorHandler(err, req, res, next) {
        if (req.xhr) {
            res.status(500).send({
                code: 500,
                notify: true,
                type: 'error',
                msg: 'An unknown error occurred. Please try again or reload page'
            });
        } else {
            //request is not ajax, forward error
            next(err);
        }
    }

    //function errorHandler(err, req, res, next) {
    //    routes.error().render_friendly_html(req, res, {
    //        msg: 'An error occurred while processing your request. Please try again.',
    //        errorCode: 500
    //    });
    //}

    function errorHandler(err, req, res, next) {
        return Promise.resolve()
            .then(function () {
                throw {
                    code: 404,
                    err: err,
                    msg: 'We could not find the resource you were looking for'
                };
            })
            .catch(function (e) {
                return rq.catchXhrErrors(req, res, e);
            });
    }

    app.use(logErrors);
    app.use(resolveUploadErrors);
    app.use(clientErrorHandler);
    app.use(errorHandler);

};