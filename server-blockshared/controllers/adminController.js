const Users = require("../models/Users")
const Transaction = require("../models/Transaction")
const Cust = require("../models/Custs")
const fs = require("fs-extra")
const path = require("path")
const bcrypt = require("bcryptjs")
const Assets = require("../models/Assets")
const Custs = require("../models/Custs")

module.exports = {
  viewSignin: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus }
      if (req.session.user == null || req.session.user == undefined) {
        res.render("index", {
          alert,
          title: "Blockshared | Login"
        });
      } else {
        res.redirect('/admin/dashboard')
      }
    } catch (error) {
      res.redirect('/admin/signin');
    }
  },
  actionSignin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await Users.findOne({ username: username })
      if (!user) {
        req.flash('alertMessage', 'User Not Found');
        req.flash('alertStatus', 'danger')
        res.redirect('/admin/signin');
      }
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        req.flash('alertMessage', 'Password Invalid');
        req.flash('alertStatus', 'danger')
        res.redirect('/admin/signin');
      }

      req.session.user = {
        id: user.id,
        username: user.username
      }

      res.redirect('/admin/dashboard');
    } catch (error) {
      res.redirect('/admin/signin');
    }
  },
  actionLogout: (req, res) => {
    req.session.destroy();
    res.redirect("/admin/signin")
  },

  // DASHBOARD
  viewDashboard: async (req, res) => {
    try {
      const cust = await Cust.find();
      const transaction = await Transaction.find();
      const asset = await Assets.find()
      res.render("admin/dashboard/view_dashboard", {
        title: "Blockshared | Dashboard",
        user: req.session.user,
        cust,
        transaction,
        asset
      });
    } catch (error) {
      res.redirect("/admin/dashboard")

    }
  },

  // TOP UP or PAYMENT
  viewPembayaran: async (req, res) => {
    try {
      const userActive = req.session.user.username
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus }
      if (userActive == "admin") {
        const transaction = await Transaction.find()
          .populate('custId')

        res.render("admin/pembayaran/view_pembayaran", {
          title: "Blockshared | TopUp",
          user: req.session.user,
          transaction,
          alert
        });
      } else if (userActive != "admin") {
        const transaction = await Transaction.find({ "produkId.owner": userActive })
          .populate('memberId')
          .populate('bankId')

        res.render("admin/pembayaran/view_pembayaran", {
          title: "Blockshared | Pembayaran",
          user: req.session.user,
          transaction,
          alert
        });
      }
    } catch (error) {
      res.redirect("/admin/pembayaran")
    }
  },
  showDetailPembayaran: async (req, res) => {
    const { id } = req.params
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus }

      const transaction = await Transaction.findOne({ _id: id })
        .populate('custId')
      res.render("admin/pembayaran/show_detail_pembayaran", {
        title: "Blockshared | Detail Pembayaran",
        user: req.session.user,
        transaction,
        alert
      });
    } catch (error) {
      res.redirect("/admin/pembayaran")
    }
  },
  actionConfirmation: async (req, res) => {
    const { id } = req.params
    try {
      const transaction = await Transaction.findOne({ _id: id })
      transaction.payments.status = "Accept"
      const updateBalance = await Cust.findOne({ _id: transaction.custId._id })
      updateBalance.poinBal = updateBalance.poinBal + transaction.bp
      await transaction.save()
      await updateBalance.save()
      req.flash('alertMessage', 'Success Corfirmation');
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/pembayaran/${id}`)

    } catch (error) {
      res.redirect(`/admin/pembayaran/${id}`)
    }
  },
  actionReject: async (req, res) => {
    const { id } = req.params
    try {
      const transaction = await Transaction.findOne({ _id: id })
      transaction.payments.status = "Reject"
      await transaction.save()
      req.flash('alertMessage', 'Success Reject');
      req.flash('alertStatus', 'success')
      res.redirect(`/admin/pembayaran/${id}`)

    } catch (error) {
      res.redirect(`/admin/pembayaran/${id}`)
    }
  },

  // USER 
  viewUser: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus }

      const userList = await Users.find()

      res.render("admin/userList/view_userList", {
        title: "Blockshared | User List",
        user: req.session.user,
        userList,
        alert
      });
    } catch (error) {
      res.redirect("/admin/dashboard")
    }
  },
  addUser: async (req, res) => {
    try {
      const { username, password } = req.body;
      await Users.create({
        username,
        password
      });
      req.flash('alertMessage', 'Success Add Bank');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/user');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/user');
    }
  },
  editUser: async (req, res) => {
    try {
      const { id, username, password } = req.body;
      console.log(req.body);
      const user = await Users.findOne({ _id: id });
      user.username = username;
      user.password = password;
      await user.save()
      req.flash('alertMessage', 'Success Update User');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/user');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/user');
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const bank = await Users.findOne({ _id: id });
      await bank.remove();
      req.flash('alertMessage', 'Success Delete User');
      req.flash('alertStatus', 'success')
      res.redirect('/admin/user');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger')
      res.redirect('/admin/user');
    }
  },

  // BLOCKCHAIN
  viewBlock: async (req, res) => {
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus }

      const blockList = await Assets.find().sort({ createdAt: -1 }).populate({ path: 'owner', select: 'email' })

      res.render("admin/blockView/view_blockList", {
        title: "Blockshared | Block List",
        user: req.session.user,
        blockList,
        alert
      });
    } catch (error) {
      res.redirect("/admin/dashboard")
    }
  },
  showDetailBlock: async (req, res) => {
    const { id } = req.params
    try {
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = { message: alertMessage, status: alertStatus }

      const asset = await Assets.findOne({ _id: id })
        .populate('custId')
      res.render("admin/blockView/show_detail_block", {
        title: "Blockshared | Detail Block",
        user: req.session.user,
        asset,
        alert
      });
    } catch (error) {
      res.redirect("/admin/blocklist")
    }
  },
  midtransStatus: async (req, res) => {
    try {
      // Create Snap API instance
      const snap = new midtransClient.Snap({
        // Set to true if you want Production Environment (accept real transaction).
        isProduction: false,
        serverKey: 'SB-Mid-server-axiEGcdKIEMchSpVzNS70xej',
        clientKey: 'SB-Mid-client-wQhJXae6UHHjo_O-'
      });

      snap.transaction.notification(notificationJson)
        .then((statusResponse) => {
          let orderId = statusResponse.order_id;
          let transactionStatus = statusResponse.transaction_status;
          let fraudStatus = statusResponse.fraud_status;

          console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`);

          // Sample transactionStatus handling logic

          if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
              // TODO set transaction status on your database to 'challenge'
              // and response with 200 OK
            } else if (fraudStatus == 'accept') {
              // TODO set transaction status on your database to 'success'
              // and response with 200 OK
            }
          } else if (transactionStatus == 'settlement') {
            // TODO set transaction status on your database to 'success'
            // and response with 200 OK
            res.status(200).json({ message: "SUCCESS" });
          } else if (transactionStatus == 'cancel' ||
            transactionStatus == 'deny' ||
            transactionStatus == 'expire') {
            // TODO set transaction status on your database to 'failure'
            // and response with 200 OK
          } else if (transactionStatus == 'pending') {
            // TODO set transaction status on your database to 'pending' / waiting payment
            // and response with 200 OK
          }
        });
    }
    catch (error) {
      res.status(404).json({ message: "Couldn't find any data !" } + error);
    }
  }
};
