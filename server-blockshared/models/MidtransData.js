const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const midtransDataSchema = new mongoose.Schema({
  transaction_time: {
    type: String,
    default: "null"
  },
  order_id: {
    type: String,
    default: "null"
  },
  payment_type: {
    type: String,
    default: "null"
  },
  transaction_status: {
    type: String,
    default: "null"
  },
  add_bal: {
    type: String,
    default: "null"
  },
  settlement_time: {
    type: String,
    default: "null"
  },
  merchant_id: {
    type: String,
    default: "null"
  },
}, { timestamps: true });

module.exports = mongoose.model("MidtransData", midtransDataSchema);
