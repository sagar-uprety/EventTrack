require("dotenv").config();
var express = require("express");
var router = express.Router();
var passport = require("passport");
// const Strategy = require("passport-facebook").Strategy;
var User = require("../models/user");
var Event = require("../models/events");
var middleware = require("../middleware");
var async=require("async");
var nodemailer=require("nodemailer");
var crypto=require("crypto");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
  cloudinary.config({
  cloud_name: "deepessence",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});              
/* passport.use(
  new Strategy(
    {
      clientID: process.env["FACEBOOK_CLIENT_ID"],
      clientSecret: process.env["FACEBOOK_CLIENT_SECRET"],
      callbackURL: "http://localhost:3000/user/return",
      profile: ["id", "displayName"]
    },
    function(accessToken, refreshToken, profile, done) {
      //Check the DB to find a User with the profile.id
      User.findOne({ facebook_id: profile.id }, function(err, user) {
        if (err) {
          console.log(err); // handle errors!
        }

        if (user) {
          done(null, user); //Login if User already exists
        } else {
          //else create a new User
          user = new User({
            facebook_id: profile.id, //pass in the id and displayName params from Facebook
            firstname: profile.displayName
          });
          user.save(function(err) {
            //Save User if there are no errors else redirect to login.
            if (err) {
              console.log(err); // handle errors!
            } else {
              console.log("saving user ...");
              done(null, user);
            }
          });
        }
      });
    }
  )
);

router.get("/", function(req, res) {
  res.render("index");
});

router.use(passport.initialize());
router.use(passport.session());

//User gets here upon successful login
router.get("/events", (req, res) => {
  // res.json({ user: user });
  console.log("Successfully logged in");
});

//This is so you know if a Login attempt failed
router.get("/login", (req, res) => {
  res.json({ msg: "login failed" });
});

//This endpoint connects the User to Facebook
router.get("/login/facebook", passport.authenticate("facebook"));

//This endpoint is the Facebook Callback URL and on success or failure returns a response to the app
router.get(
  "/return",
  passport.authenticate("facebook", {
    failureRedirect: "/login"
  }),
  (req, res) => {
    res.redirect("/events");
  }
);  */
router.get("/", function(req, res) {
  res.render("index");
});

//SHOW REGISTER FORM
router.get("/register", function(req, res) {
  res.render("register");
});
//handle sign up logic
router.post("/register", upload.single('image'), function(req, res) {
  cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
    if(err) {
      console.log(err);
      req.flash('error', err.message);
      return res.redirect('back');
    }
    var newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      contact_no: req.body.contact_no,
      image: result.secure_url,
      imageId: result.public_id,
      sex: req.body.sex,
      isVerified:false
    });
  
    console.log(newUser)
    User.register(newUser, req.body.password, function(err, user) {
      if (err) {
        req.flash("error", err.message);
        console.log(err)
        return res.redirect('back');
      }
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome to EventTrack " + user.username);  
        res.redirect('/users/' + user.id);
        // done(err,token,user);
      });
    });
  });
});
//Account verification
router.get("/:id/verify",function(req,res,next){
  async.waterfall([
    function(done) {
      crypto.randomBytes(20,function(err,buf){
        var token = buf.toString('hex');
        console.log(token)
        done(err,token);
      });
    },
    function(token,done){
      User.findOne({ _id: req.params.id},function(err,user){
        if(!user){
          req.flash("error", "No account with that email address exists.");
          console.log('no account')
          return res.redirect("/verify");
        }
        user.verificationToken=token;
        user.verificationTokenExpires= Date.now()+86400000; //1day

        user.save(function(err){
          done(err,token,user);
        });
      });
    },
    function(token,user,done){
      var smtpTransport=nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user:'eventtrackssnd@gmail.com',
          pass: process.env.GMAILPASS
        }
      });
      var mailOptions={
        to: user.email,
        from: 'eventtrackssnd@gmail.com',
        subject: 'EventTrack User Account Verification.',
        text: 'This is to verify your EventTrack user account.\n\n'+
              'Please click on the following link, or paste this into your browser to complete the process\n\n'+
              'http://' + req.headers.host + '/verify/'+token+'\n\n'+
              'The above verification link is valid only for a day.\n\n'+
              'If you did not create the account, please ignore this email.\n'
      };
      smtpTransport.sendMail(mailOptions,function(err){
        console.log('mail sent');
        req.flash('Success','Your verification token has been sent to '+req.body.email+'. Please follow the instructions as per the mail.');
        done(err,'done');
      });
    }
  ], function(err){
    if(err) return next(err);
    res.redirect('back');
  }
  )
});

//Verification token

router.get("/verify/:token",function(req,res){
  async.waterfall([
    function(done){
      User.findOne({verificationToken: req.params.token, verificationTokenExpires: { $gt: Date.now()}},function(err,user){
        if(!user){
          req.flash('error','Verification token is invalid or has expired.');
          return res.redirect('back');
        }
          user.isVerified=true;
          user.verificationToken=undefined;
          user.verificationTokenExpires=undefined;
          user.save(function(err){
            req.login(user,function(err){
              done(err,user);
            });
          });
      });
    }
  ], function(err){
    req.flash("Success","Your Account has been verified.")
    res.redirect('/events');
  })
})
// show login form
router.get("/login", function(req, res) {
  res.render("login");
});
// handling login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/events",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);

//User Profile
router.get("/users/:id", function(req,res){
  User.findById(req.params.id,function(err,foundUser){
    if(err){
      req.flash(err,"Something went WRONG!");
      res.redirect("/");
    }
    Event.find().where('author.id').equals(foundUser._id).exec(function(err, events) {
      if(err){
        req.flash(err,"Something went WRONG!");
        res.redirect("/");
      }
      res.render("users/show",{user:foundUser, events:events})
    }) 
  })
})

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/events");
});


//forgot-password route
router.get("/forgot-password",function(req,res){
  res.render("users/forgotPassword");
})

router.post("/forgot-password",function(req,res,next){
  async.waterfall([
    function(done) {
      crypto.randomBytes(20,function(err,buf){
        var token = buf.toString('hex');
        done(err,token);
      });
    },
    function(token,done){
      User.findOne({ email: req.body.email},function(err,user){
        if(!user){
          req.flash("error", "No account with that email address exists.");
          return res.redirect("/forgot-password");
        }
        user.resetPasswordToken=token;
        user.resetPasswordExpires= Date.now()+3600000; //1hour

        user.save(function(err){
          done(err,token,user);
        });
      });
    },
    function(token,user,done){
      var smtpTransport=nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user:'eventtrackssnd@gmail.com',
          pass: process.env.GMAILPASS
        }
      });
      var mailOptions={
        to: user.email,
        from: 'eventtrackssnd@gmail.com',
        subject: 'EventTrack User Account Password Reset',
        text: 'You are receiving this because you (or someone else) have requested to reset the password of your EventTrack account.\n\n'+
              'Please click on the following link, or paste this into your browser to complete the process\n\n'+
              'http://' + req.headers.host + '/reset/'+token+'\n\n'+
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions,function(err){
        console.log('mail sent');
        req.flash('Success','An e-mail has been sent to '+user.email+'with further instructions.');
        done(err,'done');
      });
    }
  ], function(err){
    if(err) return next(err);
    res.redirect('/forgot-password');
  }
  )
})

router.get('/reset/:token',function(req,res){
  User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}},function(err,user){
    if(!user){
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot-password');
    }
    res.render('users/resetPassword',{token:req.params.token});
  });
});

router.post('/reset/:token',function(req,res){
  async.waterfall([
    function(done){
      User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}},function(err,user){
        if(!user){
          req.flash('error','Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        
        if(req.body.password===req.body.confirm){
          user.setPassword(req.body.password,function(err){
            user.resetPasswordToken=undefined;
            user.resetPasswordExpires=undefined;
            user.save(function(err){
              req.login(user,function(err){
                done(err,user);
              });
            });
          })
        } else {
          req.flash("error","Passwords do not match.");
          res.redirect('back');
        }
      });
    },
    function(user,done){
      var smtpTransport=nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user:'eventtrackssnd@gmail.com',
          pass: process.env.GMAILPASS
        }
      });
      var mailOptions={
        to: user.email,
        from: 'eventtrackssnd@gmail.com',
        subject: 'EventTrack User Account Password Changed',
        text: 'The password to your EventTrack account with username '+user.username+' has been changed.\n\n'+
              'In case you don\'t recognize this activity please contact the administration of the page. The contact details can be found in the page.\n'
      };
      smtpTransport.sendMail(mailOptions,function(err){
        console.log('mail sent');
        req.flash('Success','Your Password has been changed successfully!');
        done(err);
      });
    }
  ], function(err){
    res.redirect('/events');
  })
})
module.exports = router;
