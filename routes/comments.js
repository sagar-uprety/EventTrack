var express = require("express");
var router = express.Router({mergeParams: true});
var Event = require("../models/events");
var Comment = require("../models/comments");
var middleware = require("../middleware");

//comments New form
router.get("/new", middleware.isLoggedIn, function(req, res) {
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
router.post("/", middleware.isLoggedIn, function(req, res) {
  //lookup event using ID
  Event.findById(req.params.id, function(err, events) {
    if (err) {
      console.log(err);
      res.redirect("Events/events");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          req.flash("error", "Something went wrong");
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
          req.flash("success", "Successfully added comment");
          res.redirect("/events/" + events._id);
        }
      });
    }
  });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if (err) {
      res.redirect("back");
    } else {
      res.render("Comments/edit", {
        event_id: req.params.id,
        comment: foundComment
      });
    }
  });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
    err,
    updatedComment
  ) {
    if (err) {
      res.redirect("back");
    } else {
      res.redirect("/events/" + req.params.id);
    }
  });
});
// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  //findByIdAndRemove
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Comment deleted");
      res.redirect("/events/" + req.params.id);
    }
  });
});

module.exports = router;
