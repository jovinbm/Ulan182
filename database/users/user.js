var Promise = require('bluebird');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    uniqueCuid: {type: String, unique: true, required: true, index: true},
    hashedUniqueCuid: {type: String, unique: true, index: true},
    email: {type: String, unique: false, index: true},
    emailIsConfirmed: {type: Boolean, unique: false, "default": false, index: true},
    username: {type: String, unique: false, index: true},
    firstName: {type: String, unique: false, index: true},
    lastName: {type: String, unique: false, index: true},
    password: {type: String, unique: false, index: true},
    adminLevels: {type: Array, unique: false, "default": [], index: true},
    isApproved: {type: Boolean, unique: false, "default": false, index: true},
    createdAt: {type: Date, default: Date.now, unique: false, index: true},
    isBanned: {
        status: {type: Boolean, default: false, unique: false, index: true},
        reason: {type: String, default: "", unique: false, index: true}
    },
    images: {
        profilePicture: {type: String, default: "", unique: false} //this is an amazon s3 key :don't index to due long file name
    },
    social: {
        facebook: {},
        //contains facebook credentials: {
        // accessToken:
        // signedRequest:
        //  userId:
        // dateConnected -- milliseconds since 1970 -- made from the client side
        // expiresIn
        // }
        //and
        // profile: {
        // firstName:
        // lastName:
        // name: --the active full name
        // id:
        // gender:
        // url:
        // }
        twitter: {},
        linkedIn: {}
    },
    uber: {
        request_ids: {type: Array, unique: false, "default": [], index: true},
        access_token: {type: String, unique: false, default: "", index: true},
        token_type: {type: String, unique: false, default: "", index: true},
        expires_in: {type: Number, unique: false, default: 0, index: true},
        refresh_token: {type: String, unique: false, default: "", index: true},
        scope: {type: String, unique: false, default: "", index: true}
    },
    statusLine: {type: String, unique: false, default: "", index: true},
    biography: {type: String, unique: false, default: "", index: true}
});

var textSearch = require('mongoose-text-search');
userSchema.plugin(textSearch);

userSchema.index({
    firstName: "text",
    lastName: "text",
    email: "text",
    uniqueCuid: "text",
    username: "text"
});

var User = mongoose.model('User', userSchema);

module.exports = User;