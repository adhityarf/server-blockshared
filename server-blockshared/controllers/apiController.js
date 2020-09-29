require("dotenv").config();

const bcrypt = require("bcryptjs");
const path = require("path");

const jwt = require("jsonwebtoken");
const midtransClient = require('midtrans-client');

const Asset = require("../models/Assets");
const Transaction = require("../models/Transaction");
const Cust = require("../models/Custs");
const Token = require("../models/Token");
const { token } = require("morgan");
const { deleteOne } = require("../models/Assets");

module.exports = {
  // NEW BLOCKSHARED
  signupCust: async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      const cust = await Cust.create({
        email,
        password,
        fullName,
      });
      res.status(200).json({
        message: "Signup Success",
        status: true,
      });
    } catch (error) {
      res.status(404).json({
        message: "Signup Failed" + error,
        status: false,
      });
    }
  },
  signinCust: async (req, res) => {
    try {
      const { email, password } = req.body;
      const cust = await Cust.findOne({ email: email });
      if (!cust) {
        res.status(404).json({
          message: "User Not Found !",
          status: false,
        });
      }
      const isPasswordMatch = await bcrypt.compare(password, cust.password);
      if (!isPasswordMatch) {
        res.status(404).json({
          message: "Password incorrect !",
          status: false,
        });
      }
      const custObj = {
        custId: cust.id,
        custEmail: cust.email,
      };
      const accessToken = jwt.sign(
        custObj,
        process.env.REACT_APP_ACCESS_TOKEN_SECRET,
        { expiresIn: "5m" }
      );
      const refreshToken = jwt.sign(
        custObj,
        process.env.REACT_APP_REFRESH_TOKEN_SECRET
      );

      // INSERT REFRESH TOKEN TO DB
      const token = await Token.create({
        custId: cust.id,
        custEmail: cust.email,
        refreshToken: refreshToken,
      });

      res.status(200).json({
        message: "Login Success",
        status: true,
        accessToken: accessToken,
        refreshToken: refreshToken,
        token,
      });
    } catch (error) {
      res.status(404).json({
        message: "Login Unsuccessful",
        status: false,
      });
    }
  },
  signoutCust: async (req, res) => {
    req.session.destroy();
    id = req.user.custId;
    console.log("bro: " + req.user.custId);
    const deleteRefreshToken = await Token.deleteOne({ custId: id });

    if (!deleteRefreshToken) {
      return res.status(201).json({
        message: "Failed to delete refresh token",
      });
    }

    res.status(204).json({
      message: "Logout Success",
      status: true,
    });
  },
  uploadAssets: async (req, res) => {
    try {
      const { owner } = req.body;
      const cust = await Cust.findOne({ email: owner });
      if (!req.file) {
        return res.status(404).json({
          message: "Image Not Found" + error,
        });
      }
      const extName = path.extname(`${req.file.filename}`);
      const newAsset = {
        oriFile: {
          fileName: `${req.file.filename}`,
          fileSize: `${req.file.size}`,
          fileUrl: `images/${req.file.filename}`,
          fileType: extName,
        },
        blockFile: {
          dataHash: "dataHash",
          signee: cust.fullName,
          signeeAddress: "signeeAddress",
        },
        owner: cust._id,
      };
      const asset = await Asset.create(newAsset);
      cust.assetsId.push({ _id: asset._id });
      await cust.save();
      res.status(200).json({
        asset,
        message: "Upload Asset Success",
        status: true,
      });
    } catch (error) {
      res.status(404).json({
        message: "Upload Asset Failed" + error,
        status: false,
      });
    }
  },
  topUp: async (req, res) => {
    try {
      const { nominal, bankFrom, accountHolder, code, email, bp } = req.body;
      const cust = await Cust.findOne({ email: email });
      if (!req.file) {
        return res.status(404).json({ message: "Image Not Found" });
      }

      const invoice = Math.floor(1000000 + Math.random() * 9000000);

      const total = parseInt(nominal) + parseInt(code);

      const newTopUp = {
        nominal: total,
        bp: bp,
        code: code,
        invoice,
        custId: cust.id,
        payments: {
          proofPayment: `images/${req.file.filename}`,
          bankFrom: bankFrom,
          accountHolder: accountHolder,
        },
      };

      const topUp = await Transaction.create(newTopUp);

      res.status(201).json({
        message: "Payment Success",
        topUp,
        status: true,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error" + error,
        status: false,
      });
    }
  },

  // VIEW CUST BLOCKSHARED
  dashboardPage: async (req, res) => {
    try {
      const id = req.user.custId;
      console.log(req.user);
      const asset = await Asset.find({ owner: id }).sort({ createdAt: -1 }).populate({
        path: "owner",
      });
      res.status(200).json({
        asset,
        id: req.user.id,
      });
    } catch (error) {
      res.status(404).json({ message: "Couldn't find any data !" } + error);
    }
  },
  credentialPage: async (req, res) => {
    const { cred_id } = req.params;
    console.log(cred_id)
    try {
      //const cust_id = req.session.custSess.id;
      const asset = await Asset.findOne({ _id: cred_id })
      res.status(200).json({
        asset,
        id: req.user.id,
      });
    } catch (error) {
      res.status(404).json({ message: "Couldn't find any data !" } + error);
    }
  },

  // JWT TOKEN
  refreshToken: async (req, res) => {
    const refreshTokenBody = req.body.token;
    const email = req.body.email;
    const tokendb = await Token.findOne({ refreshToken: refreshTokenBody });
    console.log(email);

    console.log(tokendb);

    if (tokendb === null) return res.sendStatus(500);
    if (refreshTokenBody === null) return res.sendStatus(401);
    if (email != tokendb.custEmail) return res.sendStatus(403);

    const custObj = {
      custId: tokendb.custId,
      custEmail: tokendb.custemail,
    };

    jwt.verify(
      refreshTokenBody,
      process.env.REACT_APP_REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) return res.status(403).json({ err });

        const accessToken = jwt.sign(
          custObj,
          process.env.REACT_APP_ACCESS_TOKEN_SECRET,
          { expiresIn: "10s" }
        );

        res.status(200).json({
          message: "Refresh token success",
          status: true,
          accessToken: accessToken,
          tokendb,
          custObj,
        });
      }
    );
  },

  // MIDTRANS
  midtransTopup: async (req, res) => {
    try {
      const { transaction_details } = req.body
      // Create Snap API instance
      const snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction: false,
        serverKey: 'SB-Mid-server-axiEGcdKIEMchSpVzNS70xej'
      });

      let parameter = {
        "transaction_details": {
          "order_id": transaction_details.order_id,
          "gross_amount": transaction_details.gross_amount
        },
      };

      snap.createTransaction(parameter)
        .then((transaction) => {
          // transaction token
          let transactionToken = transaction.token;
          console.log('transactionToken:', transactionToken);
          res.status(200).json({
            transactionToken
          });
        })
    }
    catch (error) {
      res.status(404).json({ message: "Couldn't find any data !" } + error);
    }
  }
};
