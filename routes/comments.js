var express = require("express");
var router = express.Router({mergeParams: true});
var Event = require("../models/events");
var Comment = require("../models/comments");

//comments New form
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

//Create Comments
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
                 //add username and id to comment
                 comment.author.id = req.user._id;
                 comment.author.username = req.user.username;
                 
                 //save comment
                 comment.save();

                 events.comments.push(comment);
                 events.save();
                 console.log(comment); //console output
                 
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
