var Event = require("../models/events");
var Comment = require("../models/comments");
var User = require("../models/user");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
  }
};

middlewareObj.checkUserVerification= function(req,res,next){
  User.findOne({username: req.user.username},function(err,user){
    if(!user){
      req.flash('The account with the username '+req.user.username+ ' does not exist');
      console.log('The account with the username '+req.user.username+ ' does not exist');
      res.redirect('/login')
    }
    if(user.isVerified){
      return next();
    }
    console.log('Please verify your account.')
    res.redirect('/verify');//to be changed

  })
};
middlewareObj.checkEventOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Event.findById(req.params.id, function(err, foundEvent) {
      if (err) {
        res.redirect("back");
      } else {
        // does user own the event?
        if (foundEvent.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");      
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

module.exports = middlewareObj;
