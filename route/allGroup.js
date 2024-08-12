const express = require("express");
const uuid = require("uuid");
const User = require("../models/user");
const allGroup = require("../models/allGroup");

const router = express.Router();

//----------------------------------------------class----------------------------------------------

class AllGroupController {
  //get all group as per user id
  async getAllGroup(req, res) {
    const user = await User.find(
      { userId: req.user.userId },
      " userId , profileImageURL"
    );
    const allGroups = await allGroup.find(
      { user_id: req.user._id },
      "groupId , groupName"
    );

    return res.render("allGroup", {
      user: user[0],
      allGroups: allGroups,
    });
  }
  //get to create new Group
  async getNewGroup(req, res) {
    const user = await User.find(
      { userId: req.user.userId },
      " userId , profileImageURL"
    );
    return res.render("createGroup", {
      user: user[0],
    });
  }
  //post request to create Group
  async postNewGroup(req, res) {
    const body = req.body;

    const allGroupId = uuid.v4();
    const GroupId = uuid.v4();

    allGroup.create({
      allGroupId: allGroupId,
      groupId: GroupId,
      groupName: body.name,
      user_id: req.user._id,
    });

    return res.redirect("/allGroup");
  }
  //get request to display all user of one group
  async getAllGroupMembers(req, res) {
    const user = await User.find(
      { userId: req.user.userId },
      " userId , profileImageURL"
    );

    const allUsers = await allGroup
      .find({ groupId: req.params.groupId }, "user_id , groupId , groupName")
      .populate("user_id");

    return res.render("allMember", {
      user: user[0],
      allUsers: allUsers,
    });
  }
  //get request to add member in a group
  async getAddNewMember(req, res) {
    const user = await User.find(
      { userId: req.user.userId },
      " userId , profileImageURL"
    );

    return res.render("addMember", {
      user: user[0],
      groupId: req.params.groupId,
    });
  }
  //post request to add member in a group
  async postAddNewMember(req, res) {
    const body = req.body;
    const newUser = await User.create({
      userId: uuid.v4(),
      resourceId: uuid.v4(),
      name: body.name,
      age: body.age,
    });

    const allGroupId = uuid.v4();
    const allGroups = await allGroup.find(
      { groupId: req.params.groupId },
      "groupName"
    );

    allGroup.create({
      allGroupId: allGroupId,
      groupId: req.params.groupId,
      groupName: allGroups[0].groupName,
      user_id: newUser._id,
    });

    return res.redirect(`/allgroup/${req.params.groupId}`);
  }
}
//created class instance
const allGroupController = new AllGroupController();

//----------------------------------------------routes----------------------------------------------

//get all group as per user id
router.get("/", allGroupController.getAllGroup.bind(allGroupController));
//get request to create Group
router.get("/create", allGroupController.getNewGroup.bind(allGroupController));
//post request to create Group
router.post(
  "/create",
  allGroupController.postNewGroup.bind(allGroupController)
);
//get request to display all user of one group
router.get(
  "/:groupId",
  allGroupController.getAllGroupMembers.bind(allGroupController)
);
//get request to add member in a group
router.get(
  "/add/:groupId",
  allGroupController.getAddNewMember.bind(allGroupController)
);
//post request to add member in a group
router.post(
  "/add/:groupId",
  allGroupController.postAddNewMember.bind(allGroupController)
);

module.exports = router;
