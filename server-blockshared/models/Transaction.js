const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const transactionSchema = new mongoose.Schema({
  nominal: {
    type: Number,
    required: true,
  },
  bp: {
    type: Number,
    required: true
  },
  code: {
    type: Number,
    required: true
  },
  invoice: {
    type: String,
    required: true
  },
  custId: {
    type: ObjectId,
    ref: "Custs",
  },
  payments: {
    proofPayment: {
      type: String,
      required: true,
    },
    bankFrom: {
      type: String,
      required: true,
    },
    accountHolder: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Process"
    },
  }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
