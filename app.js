//initialization starts
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs"); 

//initialization ends 

app.get("/", function(req, res) {
  res.render("index");
});


app.get("/events", function(req, res) {
  res.render("events");
});

app.get("*", function(req, res) {
  res.send("Uh Oh!!! I guess you are a bit lost!!!"); 
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server Has Started!");
});
