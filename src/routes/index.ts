import express from "express";

const router = express.Router();

router.use("/user", require("./users"));
router.use("/auth", require("./auth"));
router.use("/attendance", require("./manage-attendance"));

module.exports = router;
