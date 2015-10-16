var Promise = require('bluebird');
var winston = require('winston');

var loggerConsole = new winston.Logger({
    transports: [
        new (winston.transports.Console)()
    ]
});

function consoleLogger(data) {
    loggerConsole.info(data);
}

module.exports = {

    // this function just prints on the console
    consoleLogger: function (data) {
        consoleLogger(data);
    },

    eventLogger: function (data) {
        consoleLogger(data);
    },

    receivedLogger: function (filename, module) {
        consoleLogger(filename + ": " + module + " RECEIVED");
    },

    successLogger: function (filename, module, text) {
        if (text) {
            return "SUCCESS: " + filename + ": " + module + ": " + text;
        } else {
            return "SUCCESS: " + filename + ": " + module;
        }
    },


    errorLogger: function (filename, module, text, err) {
        if (text) {
            if (err) {
                return "ERROR: " + filename + ": " + module + ": " + text + ": err = " + err;
            } else {
                return "ERROR: " + filename + ": " + module + ": " + text + ":";
            }
        } else {
            if (err) {
                return "ERROR: " + filename + ": " + module + ": err = " + err;
            } else {
                return "ERROR: " + filename + ": " + module + ":";
            }
        }
    },

    getTheUser: function (req) {
        if (req.isAuthenticated()) {
            return req.user;
        } else if (req.customData) {
            if (req.customData.theUser) {
                return req.customData.theUser;
            } else {
                return false;
            }
        } else {
            return false;
        }
    },

    getLastPage: function (req, referrer) {
        if (req.query.lastpage && req.query.lastpage.length > 0 && (referrer.indexOf('localhost') != -1 || referrer.indexOf('pluschat.net') != -1 )) {
            return referrer;
        } else if (req.session) {
            if (req.session.lastPage) {
                return req.session.lastPage;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
};