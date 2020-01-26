var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  username: String,
  password: String,
  image: String,
  imageId: String,
  sex: String,
  registeredEvent: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Event"
    },
    name: String,
    venue: String,
    subImage: String,
    category: String
  }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
