const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, 'Please fill a valid phone number'],
    },

    password: {
      type: String,
      required: true,
    },
    profileImagePath: {
      type: String,
      default: "",
    },
    tripList: {
      type: [String], // Assuming tripList contains an array of strings
      default: [],
    },
    wishList: {
      type: [String], // Assuming wishList contains an array of strings
      default: [],
    },
    propertyList: {
      type: [String], // Assuming propertyList contains an array of strings
      default: [],
    },
    reservationList: {
      type: [String], // Assuming reservationList contains an array of strings
      default: [],
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", UserSchema);
module.exports = User;
