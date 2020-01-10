var express = require("express");
var router = express.Router({mergeParams: true});
var Event = require("../models/events");
var Comment = require("../models/comments");

router.get("/new", isLoggedIn, function(req, res) {
  // find event by id
  Event.findById(req.params.id, function(err, events) {
    if (err) {
      console.log(err);
    } else {
      res.render("Comments/new", { events: events });
    }
  });
});

router.post("/", isLoggedIn, function(req, res) {
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
  
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
