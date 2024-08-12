const mongoose = require("mongoose");

const detailsSchema = new mongoose.Schema(
  {
    detailsId: {
      type: String,
      unique: true,
    },
    userId: {
      type: String,
    },
    detailsHeadId: {
      type: String,
    },
    details: {
      testName: {
        type: String,
      },
      value: {
        type: String,
      },
      unit: {
        type: String,
      },
      refValue: [
        {
          type: String,
        },
      ],
    },

    dateOfReport: {
      type: String,
    },
  },
  { timestamps: true }
);

const details = mongoose.model("details", detailsSchema);

module.exports = details;
