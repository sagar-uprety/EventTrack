var express = require("express");
var router = express.Router();
var Event = require("../models/events");
var middleware = require("../middleware");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'deepessence', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
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
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the events object under image property
    req.body.events.image = result.secure_url;
    // add author to events
    req.body.events.author = {
      id: req.user._id,
      username: req.user.username
    }
    Event.create(req.body.events, function(err, events) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.redirect('/events/' + events.id);
    });
  });
});
// router.post("/", middleware.isLoggedIn, function(req, res) {
//   var Name = req.body.eventName;
//   var Venue = req.body.eventVenue;
//   var URL = req.body.eventURL;
//   var Description = req.body.eventDescription;
//   var author = {
//     id: req.user._id,
//     username: req.user.username
//   };
//   var newEvent = {
//     name: Name,
//     venue: Venue,
//     image: URL,
//     description: Description,
//     author: author
//   };
//   Event.create(newEvent, function(err, newlyCreated) {
//     if (err) {
//       console.log(err);
//     } else {
//       res.redirect("/events");
//     }
//   });
// });


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
  // find and update the correct events
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
