const mongoose = require("mongoose");

const detailsHeadSchema = new mongoose.Schema(
  {
    detailsHeadId: {
      type: String,
      unique: true,
    },
    userId: {
      type: String,
    },
    displayHeadId: {
      type: [String],
    },
    detailsHeadName: {
      type: String,
    },
  },
  { timestamps: true }
);

const detailsHead = mongoose.model("detailsHead", detailsHeadSchema);

module.exports = detailsHead;
