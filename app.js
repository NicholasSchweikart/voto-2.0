const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    redis = require('redis'),
    session = require('express-session'),
    redisStore = require('connect-redis')(session),
    dbRouter = require('./routes/users'),
    emailRouter = require('./routes/email'),
    loginRouter = require('./routes/login'),
    sessionsRouter = require('./routes/sessions'),
    sharedSession = require('express-socket.io-session')
    cookie = require('cookie');

    app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Create the redis client
let redisClient = redis.createClient();
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev')); // Uncomment to get back logging for all posts gets etc.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// Setup session persistence with redis
app.use(cookieParser('#$%9095854Hg22erTuxxVVI058938?'));
let store = new redisStore({
    host: 'localhost',
    port: 6379,
    client: redisClient,
    ttl: 60 * 60
});
app.use(session(
    {
        secret: '#$%9095854Hg22erTuxxVVI058938?',
        store: store,
        saveUninitialized: true,
        resave: false,
        cookie: {
            path: "/",
            maxAge: 1800000,    // 30 min max cookie life
            httpOnly: true,     // Hide from JavaScript
            //secure: true      //TODO Require an HTTPS connection
        },
        name: 'id'              // Change cookie name to obscure inner workings
    }
));

// Set up Socket IO
const
    http = require('http'),
    server = http.createServer(),
    io = require('socket.io').listen(server);

// io.use(sharedSession(session({
//     secret: '#$%9095854Hg22erTuxxVVI058938?',
//     store: new redisStore({
//         host: 'localhost',
//         port: 6379,
//         client: redisClient,
//         ttl: 60 * 60
//     }),
//     saveUninitialized: true,
//     resave: false,
//     cookie: {
//         path: "/",
//         maxAge: 1800000,    // 30 min max cookie life
//         httpOnly: true,     // Hide from JavaScript
//         //secure: true      //TODO Require an HTTPS connection
//     },
//     name: 'id'              // Change cookie name to obscure inner workings
// })));

io.set('authorization', function (handshakeData, accept) {
    let cookies = cookie.parse(handshakeData.headers.cookie);
    let cookieSessionId = cookieParser.signedCookie(cookies['id'],'#$%9095854Hg22erTuxxVVI058938?');
    store.get(cookieSessionId,(err,data)=>{
        let userId = data.userId;
        if(data.userId){
            console.log('User: ' + userId + ' authorized on socket');
            return accept(null, true);
        }
        return accept('ER_NOT_LOGGED_IN', false);
    });
});

const socketAPI = require('./socketAPI')(io);

server.listen(1212);

// Attach paths to router files
app.use('/database', dbRouter);
app.use('/email', emailRouter);
app.use('/login', loginRouter);
app.use('/sessions',sessionsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
