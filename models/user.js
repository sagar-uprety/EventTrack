var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  // facebook_id: String,
  email: {type: String, unique: true, required: true},
  username: {type: String, unique: true, required: true},
  password: String,
  contact_no: String,
  image: String,
  imageId: String,
  sex: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isVerified: Boolean,
  verificationToken: String,
  verificationTokenExpires: Date,
  registeredEvent: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Event"
    },
    name: String,
    venue: String,
    subImage: String,
    category: String,
    author:{
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }
  }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
