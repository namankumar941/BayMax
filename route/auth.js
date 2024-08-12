const User = require("../models/user");
const passport = require("passport");
const googleStrategy = require("passport-google-oauth20");
const express = require("express");
const { clientId, clientSecret } = require("../secretData");
const uuid = require("uuid");

//serialize and deserialize User
passport.serializeUser((user, done) => {
  done(null, user.userId);
});
passport.deserializeUser((userId, done) => {
  User.find({ userId: userId }).then((user) => {
    done(null, user[0]);
  });
});

//creating user using google strategy
passport.use(
  new googleStrategy(
    {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: "/auth/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      const currentUser = await User.find(
        { email: profile._json.email },
        "userId"
      );

      if (!currentUser[0]) {
        const newUser = await User.create({
          userId: profile.id,
          resourceId: uuid.v4(),
          email: profile._json.email,
          name: profile._json.name,
          profileImageURL: profile._json.picture,
          isEmailVerified: true,
        });

        done(null, { userId: newUser.userId });
      } else if (!currentUser[0].isEmailVerified) {
        await User.findOneAndUpdate(
          { email: profile._json.email },
          {
            isEmailVerified: true,
          }
        );
        done(null, currentUser[0]);
      } else {
        done(null, currentUser[0]);
      }
    }
  )
);

const router = express.Router();

//get request to get auth code from google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

//get request to get user info from google
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  res.redirect("/");
});

module.exports = router;
