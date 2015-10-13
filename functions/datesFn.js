var fileName = 'datesFn.js';

var Promise = require('bluebird');
var rq = require('../rq.js');
var moment = require('moment');

var receivedLogger = function (module) {
    return rq.receivedLogger(module, fileName);
};

var successLogger = function (module, text) {
    return rq.successLogger(module, fileName, text);
};

var errorLogger = function (module, text, err) {
    return rq.errorLogger(module, fileName, text, err);
};

function dayMilliseconds() {
    return 86400 * 1000;
}

module.exports = {
    days: function (date, daysToSubtract, daysToAdd) {
        if (daysToSubtract) {
            return new Date(date.getTime() - (daysToSubtract * dayMilliseconds())).toISOString();
        } else if (daysToAdd) {
            return new Date(date.getTime() + (daysToAdd * dayMilliseconds())).toISOString();
        } else if (daysToAdd === 0 || daysToSubtract === 0) {
            return new Date(date.getTime()).toISOString();
        } else {
            return new Date(date.getTime()).toISOString();
        }
    },

    getIsoStringFromDateObject: function (d) {
        if (d) {
            return new Date(d).toISOString();
        } else {
            return false;
        }
    },

    getTimeInFormat: function (obj) {
        var module = 'getTimeInFormat';
        receivedLogger(module);

        var returnFormat = obj.returnFormat;

        var options = {
            milliseconds: obj.milliseconds,
            seconds: obj.seconds,
            minutes: obj.minutes,
            hours: obj.hours,
            days: obj.days,
            months: obj.months,
            years: obj.years
        };

        var tempMilliseconds;

        return Promise.resolve()
            .then(function () {
                for (var format in options) {
                    if (options.hasOwnProperty(format)) {
                        if (options[format]) {
                            tempMilliseconds = moment.duration(options[format], format.toString());
                        }
                    }
                }

                return true;
            })
            .then(function () {
                if (!tempMilliseconds) {
                    throw {
                        code: 500,
                        err: new Error(errorLogger(module, 'options = ' + options + 'at least one should be specified'))
                    };
                }
            })
            .then(function () {
                return new Promise(function (resolve, reject) {
                    switch (returnFormat) {
                        case 'years':
                            resolve(tempMilliseconds.asYears());
                            break;
                        case 'months':
                            resolve(tempMilliseconds.asMonths());
                            break;
                        case 'days':
                            resolve(tempMilliseconds.asDays());
                            break;
                        case 'hours':
                            resolve(tempMilliseconds.asHours());
                            break;
                        case 'minutes':
                            resolve(tempMilliseconds.asMinutes());
                            break;
                        case 'seconds':
                            resolve(tempMilliseconds.asSeconds());
                            break;
                        case 'milliseconds':
                            resolve(tempMilliseconds.asMilliseconds());
                            break;
                        default:
                            reject({
                                code: 500,
                                err: new Error(errorLogger(module, 'not-available / returnFormat = ' + returnFormat))
                            });
                    }
                });
            });
    }
};