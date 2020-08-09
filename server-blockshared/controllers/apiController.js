const bcrypt = require("bcryptjs")
const path = require('path')

const Asset = require('../models/Assets')
const Transaction = require('../models/Transaction')
const Cust = require('../models/Custs')

module.exports = {
  // NEW BLOCKSHARED
  signupCust: async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      const cust = await Cust.create({
        email,
        password,
        fullName
      });
      res.status(200).json({
        message: "Signup Success",
        status: true
      })
    } catch (error) {
      res.status(404).json({
        message: "Signup Failed" + error,
        status: false
      })
    }
  },
  signinCust: async (req, res) => {
    try {
      const { email, password } = req.body;
      const cust = await Cust.findOne({ email: email })
      if (!cust) {
        res.status(404).json({
          message: "User Not Found !",
          status: false
        })
      }
      const isPasswordMatch = await bcrypt.compare(password, cust.password);
      if (!isPasswordMatch) {
        res.status(404).json({
          message: "Password incorrect !",
          status: false
        })
      }
      req.session.custSess = {
        id: cust.id,
        custemail: cust.email
      }
      res.status(200).json({
        message: "Login Success",
        status: true
      })
    } catch (error) {
      res.status(404).json({
        message: "Login Unsuccessful" + error,
        status: false
      })
    }
  },
  signoutCust: (req, res) => {
    req.session.destroy();
    res.status(200).json({
      message: "Session Destroyed",
      status: true
    })
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
      const extName = path.extname(`${req.file.filename}`)
      const newAsset = {
        oriFile: {
          fileName: `${req.file.filename}`,
          fileSize: `${req.file.size}`,
          fileUrl: `images/${req.file.filename}`,
          fileType: extName
        },
        blockFile: {
          dataHash: "dataHash",
          signee: cust.fullName,
          signeeAddress: "signeeAddress"
        },
        owner: cust._id,
      }
      const asset = await Asset.create(newAsset);
      cust.assetsId.push({ _id: asset._id });
      await cust.save();
      res.status(200).json({
        asset,
        message: "Upload Asset Success",
        status: true
      })
    } catch (error) {
      res.status(404).json({
        message: "Upload Asset Failed" + error,
        status: false
      })
    }
  },
  topUp: async (req, res) => {
    try {
      const {
        nominal, bankFrom, accountHolder, code, email, bp
      } = req.body;
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
          accountHolder: accountHolder
        },
      }

      const topUp = await Transaction.create(newTopUp)

      res.status(201).json({
        message: "Payment Success",
        topUp,
        status: true
      })

    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error" + error,
        status: false
      })
    }
  },

  // VIEW CUST BLOCKSHARED
  dashboardPage: async (req, res) => {
    try {
      const id = req.session.custSess.id
      const asset = await Asset.findOne({ owner: id })
        .populate({ path: 'owner' })
      res.status(200).json({
        asset
      })
    } catch (error) {
      res.status(404).json({ message: "Couldn't find any data !" } + error)
    }
  },
  credentialPage: async (req, res) => {
    try {
      const id = req.session.custSess.id
      const asset = await Asset.findOne({ owner: id })
        .populate({ path: 'owner' })
      res.status(200).json({
        asset
      })
    } catch (error) {
      res.status(404).json({ message: "Couldn't find any data !" } + error)
    }
  },
}