var express = require("express");
var router = express.Router();
var moment= require("moment")
var User = require("../models/user");
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
  cloud_name: "deepessence",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//Events Display along Categories
router.get("/category/:categ",function(req,res){
  Event.find({category:req.params.categ, eventDate: {$gt: Date.now()}}).sort('-createdAt').exec(function(err,events){
    if(err){
        console.log(err);
        res.redirect('/events');
    }
    else{
        res.render("Events/EventCateg",{ events: events });
    }
  })
});

//all events
router.get("/", function(req, res) {
  if(req.query.search){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Event.find({name: regex}, function (err, allEvents) {
      if (err) {
        console.log(err);
      } else {
        res.render("Events/events", {events: allEvents});
      }
    });
  } else{
    Event.find({eventDate: {$lte: Date.now()}},function(err,events){
      if(err) {
        console.log(err);
      } else{
        events.forEach(function(event){
          event.status=false;
          event.save();
        })
      }
    })
    Event.find({eventDate: {$gt: Date.now()}},function(err,events){
      if(err) {
        console.log(err);
      } else{
        events.forEach(function(event){
          event.status=true;
          event.save();
        })
      }
    })
    Event.find({status: true}).sort('eventDate').exec(function(err,events) {
      if(err){
        console.log(err);
      } else{
        events.forEach(function(event){
          console.log(event.eventDate)
        })
         res.render("Events/events", {events: events });
      }
    });
  }
});



//create new event form
router.get("/new", middleware.isLoggedIn, middleware.checkUserVerification, function(req, res) {
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
    //add event date
    var date=req.body.day+'/'+req.body.month+'/'+req.body.year+' '+req.body.hour+':'+req.body.minute
    req.body.events.eventDate = moment(date,"DD/MM/YYYY HH:mm").toString()
    
    var current=moment(Date.now()).format("DD/MM/YYYY HH:mm")
    if(date>current){
      req.body.events.status=true;
    } else if(date<current){
      req.body.events.status=false;
    }

    // add author to events
    req.body.events.author = {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      contact_no: req.user.contact_no
    } 

    geocoder.geocode(req.body.eventVenue, function(err, data) {
      if (err || !data.length) {
        req.flash("error", "Invalid address");
        console.log(err);
        return res.redirect("back");
      }
      req.body.events.lat = data[0].latitude;
      req.body.events.lng = data[0].longitude;
      req.body.events.location = data[0].formattedAddress;

        Event.create(req.body.events, function(err, events) {
          if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
          console.log(events);
          res.redirect("/events/" + events.id);
        });
    });
  })
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
        // console.log(foundEvent);
      }
    });
});

//Registration
router.get("/registered/:eventId/:userId",middleware.isLoggedIn,middleware.checkUserVerification,function(req,res){

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
        sex: user.sex,
        contact_no: user.contact_no
        }
        event.registeredUser.push(newRegisteredUser)
        event.save();
        //stored to users.registeredEvent object
        var newRegisteredEvent= {
          id: event._id,
          name: event.name,
          venue: event.venue,
          subImage: event.subImage,
          category: event.category,
          author:{
            id: event.author.id
          }
        }
        user.registeredEvent.push(newRegisteredEvent)
        user.save();
        return res.redirect("back");
      }
    })
  })
})
// Cancel Event Registration Route
router.get("/cancel/:eventId/:userId",function(req,res){
  Event.findOne({_id: req.params.eventId},function(err,event){
    event.registeredUser.forEach(function(user){
      if(user.id.equals(req.params.userId)){
        user.remove();
      }
    })
    event.save()
  })

  User.findOne({_id: req.params.userId},function(err,user){
    user.registeredEvent.forEach(function(event){
    
      if(event.id.equals(req.params.eventId)){
        event.remove();
      }
    })
    user.save()
  })
  req.flash('success','Your registration has been cancelled.')
  console.log('success','Your registration has been cancelled.')
  res.redirect('back')
})

//edit route
router.get("/:id/edit", middleware.checkEventOwnership, function(req, res) {
  Event.findById(req.params.id, function(err, foundEvent) {
    res.render("Events/edit", { events: foundEvent });
  });
});

// UPDATE EVENT ROUTE
router.put("/:id", middleware.checkEventOwnership, upload.single('resume'), function(req, res) {
  geocoder.geocode(req.body.eventVenue, function(err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    
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
      events.image2=req.body.URL2;
      events.image=req.body.URL;
      events.description=req.body.description;
      events.category=req.body.category;
      //update event date
      var date=req.body.day+'/'+req.body.month+'/'+req.body.year+' '+req.body.hour+':'+req.body.minute
      events.eventDate= moment(date,"DD/MM/YYYY HH:mm").toString();

      events.lat = data[0].latitude;
      events.lng = data[0].longitude;
      events.location = data[0].formattedAddress;
      events.save();
      req.flash("success","Successfully Updated!");
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

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
