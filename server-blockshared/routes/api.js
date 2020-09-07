const router = require("express").Router();
const apiController = require("../controllers/apiController");
const { upload } = require('../middlewares/multer');
const localSession = require('../middlewares/localSession');
const auth = require('../middlewares/auth');

// NEW BLOCKSHARED
router.post("/signup", apiController.signupCust);
router.post("/signin", apiController.signinCust);
//router.use(auth);
router.use(localSession);
router.delete("/signout", auth, apiController.signoutCust);
router.post("/uploadAsset", upload, apiController.uploadAssets);
router.post("/topUp", upload, apiController.topUp);

router.get("/dashboard", auth, apiController.dashboardPage);
router.get("/credential/:cred_id", auth, apiController.credentialPage);

// JWT TOKEN
router.post("/token", apiController.refreshToken);

// MIDTRANS
router.post("/topupMid", apiController.midtransTopup)

module.exports = router;
