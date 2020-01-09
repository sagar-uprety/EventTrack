var mongoose = require("mongoose");

var eventSchema = new mongoose.Schema({
  name: String,
  venue: String,
  image: String,
  description: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

module.exports = mongoose.model("Event", eventSchema);
