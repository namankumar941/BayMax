const mongoose = require("mongoose");

const displayHeadSchema = new mongoose.Schema(
  {
    displayHeadId: {
      type: String,
      unique: true,
    },
    userId: {
      type: String,
    },
    displayHeadName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const displayHead = mongoose.model("displayHead", displayHeadSchema);

module.exports = displayHead;
