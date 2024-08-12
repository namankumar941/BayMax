const User = require("../models/user");
const DisplayHead = require("../models/displayHead");
const express = require("express");
const router = express.Router();

//----------------------------------------------class----------------------------------------------

class DisplayHeadController {
  //get all group as per user id
  async getAllGroup(req, res) {
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
  }
}
//created class instance
const displayHeadController = new DisplayHeadController();

//----------------------------------------------routes----------------------------------------------

//get all group as per user id
router.get(
  "/:userId",
  displayHeadController.getAllGroup.bind(displayHeadController)
);

module.exports = router;
