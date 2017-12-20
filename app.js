const express = require("express"),
  path = require("path"),
  cookieParser = require("cookie-parser"),
  bodyParser = require("body-parser"),
  redis = require("redis"),
  session = require("express-session"),
  redisStore = require("connect-redis")(session),
  userRouter = require("./routes/users"),
  emailRouter = require("./routes/email"),
  loginRouter = require("./routes/login"),
  sessionsRouter = require("./routes/sessions"),
  serverConfig = require("./serverConfig.json"),
  app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Create the redis client
const redisClient = redis.createClient();

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req,res,next)=>{
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Setup session persistence with redis
app.use(cookieParser(serverConfig.secret));

const store = new redisStore({
  host: "localhost",
  port: 6379,
  client: redisClient,
  ttl: 3600, // One Hour Life
});
app.store = store;

app.use(session(
  {
    secret: serverConfig.secret,
    store,
    saveUninitialized: true,
    resave: true,
    rolling: true,
    cookie: {
      path: "/",
      maxAge: 2 * 1800000,  // 60 min max cookie life
      httpOnly: true,       // Hide from JavaScript
      // secure: true       //TODO Require an HTTPS connection by uncommenting here
    },
    name: "id", // Change cookie name to obscure inner workings
  },
));

// Attach paths to router files
app.use("/api/users", userRouter);
app.use("/api/email", emailRouter);
app.use("/api/login", loginRouter);
app.use("/api/sessions", sessionsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});


// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
