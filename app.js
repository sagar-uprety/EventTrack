//initialization start

const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  Event = require("./models/events"),
  Comment = require("./models/comments"),
  User = require("./models/user"),
  seedDB = require("./seeds");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/EventTrack");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
//seedDB()

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

//passport config ends

//initialization ends

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/events", function(req, res) {
  Event.find({}, function(err, allEvents) {
    if (err) {
      console.log(err);
    } else {
      res.render("Events/events", { events: allEvents });
    }
  });
});

//Create a new event and add to the Database
app.post("/events", function(req, res) {
  var Name = req.body.eventName;
  var Venue = req.body.eventVenue;
  var URL = req.body.eventURL;
  var Description = req.body.eventDescription;
  var newEvent = {
    name: Name,
    venue: Venue,
    image: URL,
    description: Description
  };
  Event.create(newEvent, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("Events/events");
    }
  });
});

app.get("/events/new", function(req, res) {
  res.render("Events/newEvent");
});

app.get("/events/:id", function(req, res) {
  Event.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundEvent) {
      if (err) {
        console.log(err);
      } else {
        //render show template with that event
        res.render("Events/show", { events: foundEvent });
      }
    });
});

//Comment Routes

app.get("/events/:id/comments/new", isLoggedIn, function(req, res) {
  // find event by id
  Event.findById(req.params.id, function(err, events) {
    if (err) {
      console.log(err);
    } else {
      res.render("Comments/new", { events: events });
    }
  });
});

app.post("/events/:id/comments", isLoggedIn, function(req, res) {
  //lookup event using ID
  Event.findById(req.params.id, function(err, events) {
    if (err) {
      console.log(err);
      res.redirect("Events/events");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          console.log(err);
        } else {
          events.comments.push(comment);
          events.save();
          res.redirect("/events/" + events._id);
        }
      });
    }
  });
  //create new comment
  //connect new comment to campground
  //redirect campground show page
});

//========Auth routes==========

//SHOW REGISTER FORM
app.get("/register", function(req, res) {
  res.render("register");
});
//handle sign up logic
app.post("/register", function(req, res) {
  var newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render("register");
    }
    passport.authenticate("local")(req, res, function() {
      res.redirect("Events/events");
    });
  });
});

// show login form
app.get("/login", function(req, res) {
  res.render("login");
});
// handling login logic
app.post("/login", passport.authenticate("local", {
    successRedirect: "Events/events",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);

// logout route
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("Events/events");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
//========Auth routes ENDS==========

app.get("*", function(req, res) {
  res.send("Uh Oh!!! I guess you are a bit lost!!!");
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server Has Started!");
});
