var envVariables = require('./environment_config.js');
var databaseURL = "mongodb://" + envVariables.uberUsername() + ":" + envVariables.uberPassword() + "@localhost:27017/uber";
var databaseURL2 = "mongodb://" + envVariables.uberUsername() + ":" + envVariables.uberPassword() + "@ds039674.mongolab.com:39674/uberlan";
console.log(databaseURL2);

var dbUrl;
if (process.env.NODE_ENV == 'production') {
    dbUrl = databaseURL2;
} else {
    dbUrl = databaseURL;
}

//THE APP
var Promise = require('bluebird');
var params = require('express-params');
var exphbs = require('express-handlebars');
var app = require('express')();
params.extend(app);
var server = require('http').Server(app);
var port = process.env.PORT || process.argv[3] || 7000;
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cors = require('cors');
var compression = require('compression');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var redis = Promise.promisifyAll(require("redis"));
var mongoose = Promise.promisifyAll(require("mongoose"));
Promise.promisifyAll(require("request"));
var bcrypt = Promise.promisifyAll(require('bcrypt'));
var rq = require('./rq.js');

var basic = require('./functions/basic.js');
basic.eventLogger('###############################################################################');
basic.eventLogger('###############################################################################');
basic.eventLogger('SUCCESSFULLY RESTARTED APPLICATION');
basic.eventLogger("ENVIRONMENT = " + process.env.NODE_ENV);
basic.eventLogger('###############################################################################');
basic.eventLogger('###############################################################################');


//mongoose.set('debug', true);
mongoose.connect(dbUrl);
var mongooseDb = mongoose.connection;
mongooseDb.on('error', console.error.bind(console, 'connection error: Problem while attempting to connect to database'));
mongooseDb.once('open', function () {
    basic.eventLogger("Successfully connected to mongodb database");
});

/*redis*/
var redisClient = redis.createClient(6379, '127.0.0.1', {});
redisClient.on("error", function (err) {
    basic.eventLogger("Error " + err);
});
redisClient.on("ready", function () {
    basic.eventLogger("Successfully connected to redis database");
});
require('./db_redis/keys.js')(app);

/*static components*/
var endPoints = rq.endPoints();
endPoints.static(app, rq);  //static endpoints here, before parsing cookies

app.use(cors());
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(session({
    name: 'uber.id',
    secret: 'hjkjfisudh2340',
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: 3600 * 24 * 14 * 1000  //14 days
    },
    saveUninitialized: true,
    resave: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());

//configure passport
require('./passport/passport.js')(app, passport, LocalStrategy);

server.listen(port, function () {
    basic.eventLogger("Server listening at port " + port);
});

require('./app_locals.js')(app);

module.exports = {
    app: function () {
        return app;
    },

    redisClient: function () {
        return redisClient;
    }
};

endPoints.core(app, rq);
endPoints.uber(app, rq);
endPoints.notFound(app, rq);
endPoints.error(app, rq);

/*
 rendering engine
 */
var hbs = exphbs.create({
    helpers: app.locals,
    extname: '.hbs',
    partialsDir: [
        'views/'
    ]
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');