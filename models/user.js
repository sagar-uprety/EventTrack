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
  sex: String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
