//initialization starts

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/EventTrack");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

//initialization ends

var eventSchema = new mongoose.Schema({
  EventName: String,
  EventVenue: String,
  EventURL: String
});

var event = mongoose.model("event", eventSchema);

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
  event.find({}, function(err, allEvents) {
    if (err) {
      console.log(err);
    } else {
      res.render("events", { events: allEvents });
    }
  });
});

//Create a new event and add to the Database
app.post("/events", function(req, res) {
  var name = req.body.eventName;
  var venue = req.body.eventVenue;
  var url = req.body.eventURL;
  var newEvent = {
    EventName: name,
    EventVenue: venue,
    EventURL: url
  };
  event.create(newEvent, function(err, newlyCreated) {
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

app.get("*", function(req, res) {
  res.send("Uh Oh!!! I guess you are a bit lost!!!");
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server Has Started!");
});
