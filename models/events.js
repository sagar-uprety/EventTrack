var mongoose = require("mongoose");

var eventSchema = new mongoose.Schema({
  name: String,
  venue: String,
  image: String,
  image2: String,
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String,
    email: String,
    phone: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

module.exports = mongoose.model("Event", eventSchema);
