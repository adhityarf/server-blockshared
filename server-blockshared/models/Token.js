const mongoose = require("mongoose");
const bycrypt = require("bcryptjs");

const tokenSchema = new mongoose.Schema({
  custId: {
    type: String,
    required: true,
  },
  custEmail: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Tokens", tokenSchema);
