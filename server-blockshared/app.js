var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const session = require('express-session');
const flash = require('connect-flash')
// import mongoose
const mongoose = require("mongoose");
mongoose.connect(
  // "mongodb+srv://blockshared:blockshared@blockshared.oonpe.mongodb.net/v1", NODE.js v.3.6 or later
  "mongodb://blockshared:blockshared@blockshared-shard-00-00.oonpe.mongodb.net:27017,blockshared-shard-00-01.oonpe.mongodb.net:27017,blockshared-shard-00-02.oonpe.mongodb.net:27017/v1?ssl=true&replicaSet=atlas-bjtq24-shard-0&authSource=admin&retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// router admin
const adminRouter = require("./routes/admin");
// router api
const apiRouter = require("./routes/api");

var app = express();

// Header for CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://www.blockshared.id"); // keep this if your api accepts cross-origin requests
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
  res.header("Access-Control-Allow-Method", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});

// add middleware to parse the json
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(methodOverride('_method'));
app.use(session({
  secret: 'keyboard car',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}));
app.use(flash());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/sb-admin-2",
  express.static(path.join(__dirname, "node_modules/startbootstrap-sb-admin-2"))
);

app.use("/", indexRouter);
app.use("/users", usersRouter);
// admin
app.use("/admin", adminRouter);
app.use("/api/v1/member", apiRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
