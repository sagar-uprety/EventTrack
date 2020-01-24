var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Event = require("../models/events");

router.get("/", function(req, res) {
  res.render("index");
});

//SHOW REGISTER FORM
router.get("/register", function(req, res) {
  res.render("register");
});
//handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    username: req.body.username,
    image: req.body.image
  });
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("/register");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome to EventTrack " + user.username);  
      res.redirect("/events");
    });
  });
});

// show login form
router.get("/login", function(req, res) {
  res.render("login");
});
// handling login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/events",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);

//User Profile
router.get("/users/:id", function(req,res){
  User.findById(req.params.id,function(err,foundUser){
    if(err){
      req.flash(err,"Something went WRONG!");
      res.redirect("/");
    }
    Event.find().where('author.id').equals(foundUser._id).exec(function(err, events) {
      if(err){
        req.flash(err,"Something went WRONG!");
        res.redirect("/");
      }
      res.render("users/show",{user:foundUser, events:events})
    })
  })
})

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/events");
});

module.exports = router;
