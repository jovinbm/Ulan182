module.exports = function (app, rq) {
    var routes = rq.routes();

//not found
    app.get('*', function (req, res) {
        routes.error().render_friendly_html(req, res, {
            msg: 'Oops! We could not find the page you were looking for.',
            errorCode: 404
        });
    });
    app.post('*', function (req, res) {
        routes.error().render_friendly_html(req, res, {
            msg: 'Oops! We could not find the page you were looking for.',
            errorCode: 404
        });
    });

};