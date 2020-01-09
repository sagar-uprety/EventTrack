//initialization starts

const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      Event = require('./models/events'),
      Comment= require('./models/comments'),
      seedDB = require('./seeds')

mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
mongoose.connect('mongodb://localhost/EventTrack')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'ejs')
seedDB()

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

app.get('/', function (req, res) {
  res.render("index")
})

app.get('/events', function (req, res) {
  Event.find({}, function (err, allEvents) {
    if (err) {
      console.log(err)
    } else {
      res.render("Events/events", { events: allEvents })
    }
  })
})

//Create a new event and add to the Database
app.post('/events', function (req, res) {
  var Name = req.body.eventName
  var Venue = req.body.eventVenue
  var URL = req.body.eventURL
  var Description = req.body.eventDescription
  var newEvent = {
    name: Name,
    venue: Venue,
    image: URL,
    description: Description
  }
  Event.create(newEvent, function (err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("Events/events");
    }
  })
})

app.get('/events/new', function (req, res) {
  res.render("Events/newEvent")
})

app.get('/events/:id', function (req, res) {
  Event.findById(req.params.id)
    .populate('comments')
    .exec(function (err, foundEvent) {
      if (err) {
        console.log(err)
      } else {
        //render show template with that event
        res.render("Events/show", { events: foundEvent })
      }
    })
})

//Comment Routes

app.get("/events/:id/comments/new", function(req, res) {
  // find campground by id
  Event.findById(req.params.id, function(err, events) {
    if (err) {
      console.log(err);
    } else {
      res.render("Comments/new", { events: events });
    }
  });
});

app.post("/events/:id/comments", function(req, res) {
  //lookup campground using ID
  Event.findById(req.params.id, function(err, events) {
    if (err) {
      console.log(err);
      res.redirect("Events/events");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          console.log(err);
        } else {
          events.comments.push(comment);
          events.save();
          res.redirect("/events/" + events._id);
        }
      });
    }
  });
  //create new comment
  //connect new comment to campground
  //redirect campground show page
});
app.get('*', function (req, res) {
  res.send('Uh Oh!!! I guess you are a bit lost!!!')
})

var port = process.env.PORT || 3000
app.listen(port, function () {
  console.log('Server Has Started!')
})
