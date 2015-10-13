var Promise = require('bluebird');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var uberRide = new Schema({
    uniqueCuid: {type: String, unique: true, required: true, index: true},
    userUniqueCuid: {type: String, unique: false, required: true, index: true},
    startLatitude: {type: String, unique: false, index: true},
    startLongitude: {type: String, unique: false, index: true},
    endLatitude: {type: String, unique: false, index: true},
    endLongitude: {type: String, unique: false, index: true},
    request_id: {type: String, unique: false, index: true},
    active: {type: Boolean, unique: false, index: true},
    createdAt: {type: Date, default: Date.now, unique: false, index: true}
});

var UberRide = mongoose.model('UberRide', uberRide);

module.exports = UberRide;