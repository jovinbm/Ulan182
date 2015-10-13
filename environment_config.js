module.exports = {
    //axpUsername
    //axpPassword
    //AWS_ACCESS_KEY_ID for jovinbm
    //AWS_SECRET_ACCESS_KEY for jovinbm
    //NODE_ENV

    uberUsername: function () {
        return process.env.uberUsername;
    },

    uberPassword: function () {
        return process.env.uberPassword;
    }
};