var mongoose = require("mongoose");

var eventSchema = new mongoose.Schema({
  name: String,
  venue: String,
  image: String,
  subImage: String,
  imageId: String,
  category: String,
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  registeredUser: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    name: String,
    username: String,
    email: String,
    sex: String
  }]
});

module.exports = mongoose.model("Event", eventSchema);
