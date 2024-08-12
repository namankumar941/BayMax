const User = require("../models/user");
const allGroup = require("../models/allGroup");
const DisplayHead = require("../models/displayHead");
const uuid = require("uuid");

const express = require("express");

const router = express.Router();

//get all group as per user id
router.get("/:userId", async (req, res) => {
  const user = await User.find(
    { userId: req.user.userId },
    " userId , profileImageURL"
  );
  const displayHead = await DisplayHead.find(
    { userId: req.params.userId },
    "displayHeadId , displayHeadName"
  );
  return res.render("displayHead", {
    user: user[0],
    displayHeads: displayHead,
    userId: req.params.userId,
  });
});

module.exports = router;
