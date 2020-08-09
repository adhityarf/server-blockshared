const mongoose = require("mongoose");
const bycrypt = require("bcryptjs");
const { ObjectId } = mongoose.Schema;

const custsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true
  },
  poinBal: {
    type: Number,
    default: 0
  },
  assetsId: [{
    type: ObjectId,
    ref: 'Assets'
  }]
}, { timestamps: true });

custsSchema.pre('save', async function (next) {
  const custs = this;
  if (custs.isModified('password')) {
    custs.password = await bycrypt.hash(custs.password, 8);
  }
})

module.exports = mongoose.model("Custs", custsSchema);