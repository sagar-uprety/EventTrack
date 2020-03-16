var mongoose = require("mongoose"),
    Event = require("./models/events"),
    Comment = require("./models/comments");
    User = require("./models/user");

async function seedDB() {
  try {
    await Event.deleteMany({});
    console.log("Events removed");

    await User.deleteMany({});
    console.log("Users removed");

    await Comment.deleteMany({});
    console.log("Comments removed");

  } catch (err) {
    console.log(err);
  }
}

module.exports = seedDB;
