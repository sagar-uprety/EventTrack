var express = require("express");
var router = express.Router();
var User = require("../models/user");
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
      console.log()
      res.render("Events/events", { events: allEvents });
    }
  });
});

//Events Display along Categories
router.get("/category/:categ",function(req,res){
  Event.find({category: req.params.categ},function(err,events){
      if(err){
          console.log(err);
          res.redirect('/events');
      }
      else{
          res.render("Events/EventCateg",{ events: events });
      }
  })
});

//create new event form
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("Events/newEvent");
});


//Create a new event and add to the Database
router.post("/", middleware.isLoggedIn, upload.single('resume'), function(req, res) {
  cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
    if(err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    // add cloudinary url for the image to the events object under image property
    req.body.events.subImage = result.secure_url;
    // add image's public_id to events object
    req.body.events.imageId = result.public_id;
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

//Registration
router.get("/registered/:eventId/:userId",middleware.isLoggedIn,function(req,res){
  Event.findById(req.params.eventId,function(err1,event){
    if(err1){
      console.log(err1);
    }
    User.findById(req.params.userId,function(err2,user){
      if(err2){
        console.log(err2);
      }
      else{
        //stored to events.registeredUser object
        var newRegisteredUser= {
        id: user._id,
        name: user.firstName+ " "+user.lastName,
        username: user.username,
        email: user.email,
        sex: user.sex
        }
        event.registeredUser.push(newRegisteredUser)
        event.save();
        //stored to users.registeredEvent object
        var newRegisteredEvent= {
          id: event._id,
          name: event.name,
          venue: event.venue,
          subImage: event.subImage,
          category: event.category
        }
        user.registeredEvent.push(newRegisteredEvent)
        user.save();
        res.redirect("/events");
      }
    })
  })
})
// Cancel Event Registration Route
// router.get("/cancel/:eventId/:regUserId",function(req,res){
//   //event._id
//   //event.registeredUser._id

//   Event.findById(req.params.eventId,function(err,foundEvent){
//     console.log(foundEvent,req.params.eventId)
//   })
//   res.redirect('/events')
// })

//edit route
router.get("/:id/edit", middleware.checkEventOwnership, function(req, res) {
  Event.findById(req.params.id, function(err, foundEvent) {
    res.render("Events/edit", { events: foundEvent });
  });
});
//Event Information route
router.get("/myevent/:name/:id",middleware.checkEventOwnership,function(req,res){
  Event.findById(req.params.id,function(err,foundEvent){
    res.render("Events/myEvent", { events: foundEvent})
  });
});

// UPDATE EVENT ROUTE
router.put("/:id", middleware.checkEventOwnership, upload.single('resume'), function(req, res) {
  // find and update the correct events
  Event.findById(req.params.id, async function(err, events) {
    if (err) {
      req.flash("error",err.message);
      res.redirect("/events");
    } else {
      if(req.file){
        try{
          await cloudinary.v2.uploader.destroy(events.imageId);
          var result= await cloudinary.v2.uploader.upload(req.file.path);
          events.imageId=result.public_id;
          events.subImage=result.secure_url;
        } catch(err){
          req.flash("error",err.message);
          return res.redirect("/events");
        }   
    }
    events.name=req.body.name;
    events.venue=req.body.venue;
    events.image=req.body.eventURL;
    events.description=req.body.description;
    events.category=req.body.category;
    events.save();
    req.flash("success","Successfully Updated!");
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
