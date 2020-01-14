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

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit",checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("Comments/edit", {event_id: req.params.id, comment: foundComment});
      }
   });
});

// COMMENT UPDATE
router.put("/:comment_id",checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/events/" + req.params.id );
      }
   });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id",checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
           res.redirect("/events/" + req.params.id);
       }
    });
});

function checkCommentOwnership (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}



module.exports = router;
