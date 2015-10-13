module.exports = function (app, rq) {

    var express = require('express');
    var path = require('path');

    var favicon = require('serve-favicon');

    app.use(favicon(path.join(__dirname, '../', '/public/favicons/uber.png')));
    app.use("/bower_components", express.static(path.join(__dirname, '../', '/bower_components')));
    app.use("/public", express.static(path.join(__dirname, '../', '/public')));
    app.use("/views", express.static(path.join(__dirname, '../', '/views')));
    app.use("/error", express.static(path.join(__dirname, '../', '/public/error')));
};