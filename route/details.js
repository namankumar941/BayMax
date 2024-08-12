const User = require("../models/user");
const DetailsHead = require("../models/detailsHead");
const Details = require("../models/details");

const express = require("express");
const router = express.Router();

//get all details head under display head as per user id
router.get("/detailsHead/:combinedId", async (req, res) => {
  const [displayHeadId, userId] = req.params.combinedId.split("@break$");

  const user = await User.find(
    { userId: req.user.userId },
    " userId , profileImageURL"
  );

  const detailsHead = await DetailsHead.find(
    {
      userId: userId,
      displayHeadId: { $in: [displayHeadId] },
    },
    "detailsHeadId , userId , detailsHeadName"
  ).sort({ detailsHeadName: -1 });

  return res.render("detailsHead", {
    user: user[0],
    detailsHeads: detailsHead,
  });
});

//get all details under details head as per user id
router.get("/:combinedId", async (req, res) => {
  const [detailsHeadId, userId] = req.params.combinedId.split("@break$");

  const user = await User.find(
    { userId: req.user.userId },
    " userId , profileImageURL"
  );

  const details = await Details.find(
    {
      userId: userId,
      detailsHeadId: detailsHeadId,
    },
    "details , dateOfReport"
  );

  return res.render("details", {
    user: user[0],
    details: details,
  });
});

module.exports = router;
