const mongoose = require("mongoose");

const allGroupSchema = new mongoose.Schema(
  {
    allGroupId: {
      type: String,
      unique: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    groupId: {
      type: String,
    },
    groupName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const allGroup = mongoose.model("allGroup", allGroupSchema);

module.exports = allGroup;
