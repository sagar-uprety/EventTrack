//initialization starts

const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      Event = require("./models/events"),
      seedDB = require("./seeds");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/EventTrack");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
seedDB();

//initialization ends


//addind data to database

/* event.create(
  {
    EventName: "RussFest2",
    EventVenue: "Silicon Valley",
    EventURL: "https://www.thesun.co.uk/wp-content/uploads/2019/01/CES2.jpg"
  },
  function(err, addRes) {
    if (err) {
      console.log("Error");
    } else {
      console.log("New data saved");
      console.log(addRes);
    }
  }
); */

//finding data from database

/* event.find({}, function(err, findRes) {
  if (err) {
    console.log("Error Found");
    console.log(err);
  } else {
    console.log("All Events ....");
    console.log(findRes);
  }
});  */

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/events", function(req, res) {
  Event.find({}, function(err, allEvents) {
    if (err) {
      console.log(err);
    } else {
      res.render("events", { events: allEvents });
    }
  });
});

//Create a new event and add to the Database
app.post("/events", function(req, res) {
  var Name = req.body.eventName;
  var Venue = req.body.eventVenue;
  var URL = req.body.eventURL;
  var Description= req.body.eventDescription;
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
      res.redirect("/events");
    }
  });
});

app.get("/events/new", function(req, res) {
  res.render("newEvent");
});

app.get("/events/:id",function(req,res){
  Event.findById(req.params.id, function(err, foundEvent){
        if(err){
            console.log(err);
        } else {
          //render show template with that campground
            res.render("show", {events: foundEvent});
        }
  });
})

app.get("*", function(req, res) {
  res.send("Uh Oh!!! I guess you are a bit lost!!!");
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server Has Started!");
});
