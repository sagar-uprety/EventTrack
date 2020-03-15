var mongoose = require("mongoose");

var eventSchema = new mongoose.Schema({
  name: String,
  image: String,
  subImage: String,
  imageId: String,
  category: String,
  image2: String,
  eventDate: Date,
  description: String,
  location: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
  status: Boolean,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String,
    email: String,
    contact_no: String,
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
    contact_no: String,
    sex: String
  }]
});

module.exports = mongoose.model("Event", eventSchema);
