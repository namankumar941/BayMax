const User = require("../models/user");
const allGroup = require("../models/allGroup");
const uuid = require("uuid");

const express = require("express");

const router = express.Router();

//----------------------------------------------class----------------------------------------------

class UserController {
  //get request to user details
  async getUserDetails(req, res) {
    const user = await User.find(
      { userId: req.user.userId },
      " userId , profileImageURL"
    );

    const userDetails = await User.find({ userId: req.params.userId });

    return res.render("viewUserDetails", {
      user: user[0],
      userDetails: userDetails[0],
    });
  }
}
//created class instance
const userController = new UserController();

//----------------------------------------------routes----------------------------------------------

//get request to login user
router.get("/login", (req, res) => {
  return res.render("login");
});

//get request to user details
router.get("/:userId", userController.getUserDetails.bind(userController));

module.exports = router;
