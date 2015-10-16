module.exports = function (app, rq) {
    var Promise = require("bluebird");

//not found
    app.get('*', function (req, res) {
        return Promise.resolve()
            .then(function () {
                throw {
                    code: 404,
                    err: new Error('We could not find the resource you were looking for'),
                    msg: 'We could not find the resource you were looking for'
                };
            })
            .catch(function (e) {
                return rq.catchXhrErrors(req, res, e);
            });
    });
    app.post('*', function (req, res) {
        return Promise.resolve()
            .then(function () {
                throw {
                    code: 404,
                    err: new Error('We could not find the resource you were looking for'),
                    msg: 'We could not find the resource you were looking for'
                };
            })
            .catch(function (e) {
                return rq.catchXhrErrors(req, res, e);
            });
    });

};