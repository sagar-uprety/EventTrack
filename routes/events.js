var express = require("express");
var router = express.Router();
var Event = require("../models/events");

//all events
router.get("/", function(req, res) {
  Event.find({}, function(err, allEvents) {
    if (err) {
      console.log(err);
    } else {
      res.render("Events/events", { events: allEvents });
    }
  });
});

//Create a new event and add to the Database
router.post("/", isLoggedIn, function(req, res) {
  var Name = req.body.eventName;
  var Venue = req.body.eventVenue;
  var URL = req.body.eventURL;
  var Description = req.body.eventDescription;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newEvent = {
    name: Name,
    venue: Venue,
    image: URL,
    description: Description,
    author: author
  };
  Event.create(newEvent, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/events");
    }
  });
});

//create new event form
router.get("/new", isLoggedIn, function(req, res) {
  res.render("Events/newEvent");
});

//event details show page
router.get("/:id", function(req, res) {
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

//edit route
router.get("/:id/edit", checkEventOwnership, function(req, res) {
  Event.findById(req.params.id, function(err, foundEvent) {
    res.render("Events/edit", { events: foundEvent });
  });
});

// UPDATE EVENT ROUTE
router.put("/:id", checkEventOwnership, function(req, res) {
  // find and update the correct campground
  Event.findByIdAndUpdate(req.params.id, req.body.event, function(
    err,
    updatedEvent
  ) {
    if (err) {
      res.redirect("/events");
    } else {
      //redirect somewhere(show page)
      res.redirect("/events/" + req.params.id);
    }
  });
});

// DESTROY EVENT ROUTE
router.delete("/:id",checkEventOwnership, function(req, res){
   Event.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/events");
      } else {
          res.redirect("/events");
      }
   });
});




//middleware
 function checkEventOwnership (req, res, next) {
  if (req.isAuthenticated()) {
    Event.findById(req.params.id, function(err, foundEvent) {
      if (err) {
        res.redirect("back");
      } else {
        // does user own the campground?
        if (foundEvent.author.id.equals(req.user._id)) {
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
