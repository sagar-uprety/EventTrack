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

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs"); 

//initialization ends 

var eventSchema = new mongoose.Schema({
  EventName: String,
  EventVenue: String,
  EventURL: String
});

var event= mongoose.model("event",eventSchema);

var itFest= new event({
  EventName: "IT Fest",
  EventVenue: "Vancouver",
  EventURL: "https://www.thesun.co.uk/wp-content/uploads/2019/01/CES2.jpg"
});

itFest.save(function (err, eventa) {
  if(err){
    console.log("Error");
  }
  else{
    console.log("New data saved");
    console.log(eventa);
  }
});

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/events", function(req, res) {
  res.render("events");
});

app.post("/events",function(req,res) {
  var EventName= req.body.eventName;
  var EventVenue= req.body.eventVenue;
  var EventURL= req.body.eventURL;

  res.redirect("/events")
});

app.get("/events/new",function (req,res) {
  res.render("newEvent")
});

app.get("*", function(req, res) {
  res.send("Uh Oh!!! I guess you are a bit lost!!!"); 
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server Has Started!");
});
