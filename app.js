require('dotenv').config();
//initialization start

const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash =  require("connect-flash"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  Strategy = require('passport-facebook').Strategy,
  methodOverride = require("method-override"),
  Event = require("./models/events"),
  Comment = require("./models/comments"),
  User = require("./models/user"),
  seedDB = require("./seeds");

//requring routes
var commentRoutes    = require("./routes/comments"),
    eventRoutes = require("./routes/events"),
    indexRoutes      = require("./routes/index")

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/EventTrack");

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname +"/public/"));
app.set("view engine","ejs");
app.use(flash());
// seedDB(); //-- resets database ....uncomment to reset 
app.locals.moment = require('moment');
//passport config starts
app.use(
  require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
//passport config ends
//initialization ends
app.use("/", indexRoutes);
app.use("/events", eventRoutes);
app.use("/events/:id/comments", commentRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server Has Started!");
});
