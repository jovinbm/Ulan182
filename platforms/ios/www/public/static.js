module.exports = function (app, rq) {

    var express = require('express');
    var path = require('path');
    var routes = rq.routes();

    var favicon = require('serve-favicon');

    app.use(favicon(path.join(__dirname, '../', '/public/favicons/favicon-32x32.png'))); //2kb favicon
    app.use("/bower_components", express.static(path.join(__dirname, '../', '/bower_components')));
    app.use("/public", express.static(path.join(__dirname, '../', '/public')));
    app.use("/uploads", express.static(path.join(__dirname, '../', '/uploads')));
    app.use("/views", express.static(path.join(__dirname, '../', '/views')));
    app.use("/error", express.static(path.join(__dirname, '../', '/public/error')));
    app.get('/sitemap.xml', routes.sitemap().render_siteMap_xml);
    app.get('/old_sitemap.xml', function (req, res) {
        res.status(200).sendFile(path.join(__dirname, '../', '/public/old_sitemap.xml'));
    });
    app.get('/robots.txt', function (req, res) {
        res.status(200).sendFile(path.join(__dirname, '../', '/public/robots.txt'));
    });
};