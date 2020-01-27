var mongoose = require("mongoose"),
    Event = require("./models/events"),
    Comment = require("./models/comments");
    User = require("./models/user");

var seeds = [
  {
    name: "TechCrunch",
    image: "https://www.thesun.co.uk/wp-content/uploads/2019/01/CES2.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
  },
  {
    name: "CES 2020",
    image:
      "https://portugalstartups.com/wp-content/uploads/2019/07/TC_Disrupt_Social_FB10.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicinjg elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
  },
  {
    name: "Food Carnival",
    image:
      "https://www.thebetterindia.com/wp-content/uploads/2017/03/Palate-Fest-in-Delhi-1.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"
  }
];
async function seedDB() {
  try {
    await Event.deleteMany({});
    console.log("Events removed");

    await User.deleteMany({});
    console.log("Users removed");

    await Comment.deleteMany({});
    console.log("Comments removed");

    // await Comment.deleteMany({});
    // console.log("Comments removed");

    // for (const seed of seeds) {
    //   let event = await Event.create(seed);
    //   console.log("Campground created");
    //   let comment = await Comment.create({
    //     text: "This place is great, but I wish there was internet",
    //     author: "Homer"
    //   });
    //   console.log("Comment created");
    //   event.comments.push(comment);
    //   event.save();
    //   console.log("Comment added to campground");
    // }
  } catch (err) {
    console.log(err);
  }
}

module.exports = seedDB;
