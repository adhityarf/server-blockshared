const router = require("express").Router();
const adminController = require("../controllers/adminController");
const auth = require('../middlewares/authAdmin');
const localSession = require('../middlewares/localSession');

// MIDTRANS NOTIFICATIOn
router.post("/notification", adminController.midtransStatus)

// ADMIN FUNCTION
router.get("/signin", adminController.viewSignin);
router.post("/signin", adminController.actionSignin);
router.use(auth);
router.use(localSession);
router.get("/logout", adminController.actionLogout);

// ADMIN DASHBOARD
router.get("/dashboard", adminController.viewDashboard);

// END-POINT PEMBAYARAN
router.get("/pembayaran", adminController.viewPembayaran);
router.get("/pembayaran/:id", adminController.showDetailPembayaran);
router.put("/pembayaran/:id/confirmation", adminController.actionConfirmation);
router.put("/pembayaran/:id/reject", adminController.actionReject);

// END-POINT USER MANAGEMENT
router.get("/user", adminController.viewUser);
router.post("/user", adminController.addUser);
router.put("/user", adminController.editUser);
router.delete("/user/:id", adminController.deleteUser);

// END-POINT BLOCKCHAIN
router.get("/blocklist", adminController.viewBlock);
router.get("/blocklist/:id", adminController.showDetailBlock);

module.exports = router;
