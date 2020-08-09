const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const assetSchema = new mongoose.Schema({
  oriFile: {
    fileName: {
      type: String,
      require: [true, "name required"],
    },
    fileSize: {
      type: String,
      require: [true, "size required"],
    },
    fileUrl: {
      type: String,
      require: [true, "URL required"],
    },
    fileType: {
      type: String,
      require: [true, "Type required"],
    },
  },
  blockFile: {
    dataHash: {
      type: String,
      require: [true, "dataHash required"],
    },
    anchor: {
      type: String,
      default: "Blockshared",
    },
    signee: {
      type: String,
      require: [true, "signee required"],
    },
    signeeAddress: {
      type: String,
      require: [true, "signeeAddress required"],
    }
  },
  owner: [
    {
      type: ObjectId,
      ref: "Custs"
    }
  ],
  status: {
    type: String,
    default: "Registered"
  },
}, { timestamps: true });

module.exports = mongoose.model("Asset", assetSchema);
