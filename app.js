//initialization start
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs"); 
//initialization ends 
app.get("/", function(req, res) {
  res.send("Home Page Reached");
});

app.get("*", function(req, res) {
  res.send("<h1>Wallah</h1>"); 
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server Has Started!");
});
