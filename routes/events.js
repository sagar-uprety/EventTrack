var express = require("express");
var router = express.Router();
var Event = require("../models/events");
var middleware = require("../middleware");

var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);

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



//create new event form
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("Events/newEvent");
});


//Create a new event and add to the Database
router.post("/", middleware.isLoggedIn, function(req, res) {
  var Name = req.body.eventName;
  var URL = req.body.eventURL;
  var URL2= req.body.eventURL2;
  var Description = req.body.eventDescription;
  var author = {
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    phone: req.user.phone
  };
  geocoder.geocode(req.body.eventVenue, function(err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      console.log(err);
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newEvent = {
      name: Name,
      image: URL,
      image2: URL2,
      description: Description,
      author: author,
      location: location,
      lat: lat,
      lng: lng
    };
    Event.create(newEvent, function(err, newlyCreated) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/events");
      }
    });
  });
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
router.get("/:id/edit", middleware.checkEventOwnership, function(req, res) {
  Event.findById(req.params.id, function(err, foundEvent) {
    res.render("Events/edit", { events: foundEvent });
  });
});

// UPDATE EVENT ROUTE
router.put("/:id", middleware.checkEventOwnership, function(req, res) {
  // find and update the correct campground
   geocoder.geocode(req.body.location, function(err, data) {
     if (err || !data.length) {
       req.flash("error", "Invalid address");
       return res.redirect("back");
     }
     var lat = data[0].latitude;
     var lng = data[0].longitude;
     var location = data[0].formattedAddress;
     var newEvent = {
       name: Name,
       venue: Venue,
       image: URL,
       image2: URL2,
       description: Description,
       author: author,
       location: location,
       lat: lat,
       lng: lng
     };
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
});

// DESTROY EVENT ROUTE
router.delete("/:id", middleware.checkEventOwnership, function(req, res) {
  Event.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/events");
    } else {
      res.redirect("/events");
    }
  });
});

module.exports = router;
