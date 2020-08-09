const router = require("express").Router();
const apiController = require("../controllers/apiController");
const { upload } = require('../middlewares/multer');
const localSession = require('../middlewares/localSession');

// NEW BLOCKSHARED
router.post("/signup", apiController.signupCust);
router.post("/signin", apiController.signinCust);
//router.use(auth);
router.use(localSession);
router.post("/signout", apiController.signoutCust);
router.post("/uploadAsset", upload, apiController.uploadAssets);
router.post("/topUp", upload, apiController.topUp);

router.get("/dashboard", apiController.dashboardPage);
router.get("/credential", apiController.credentialPage);


module.exports = router;
