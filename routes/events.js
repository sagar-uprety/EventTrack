var express = require("express");
var router = express.Router();
var Event = require("../models/events");

//events routes

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
router.post("/", function(req, res) {
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

router.get("/new", function(req, res) {
  res.render("Events/newEvent");
});

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

module.exports = router;
