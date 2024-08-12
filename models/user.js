const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: { type: String },
    resourceId: { type: String },
    email: { type: String },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    phoneNumber: {
      type: Number,
    },
    profileImageURL: {
      type: String,
      default: "/default.png",
    },
  },
  { timestamps: true }
);

const user = mongoose.model("user", userSchema);

module.exports = user;
