import express from "express";
import passport from "passport";
import { entryPoint } from "../middleware/entrypoint";
import { exitPoint } from "../middleware/exitpoint";
import * as ManageTime from "../controllers/manage-attendance";

const router = express.Router();
const authenticate = passport.authenticate("bearer", { session: false });

router.post(
  "/add",
  entryPoint,
  authenticate,
  ManageTime.addTimeInAndOut,
  exitPoint
);

router.post(
  "/find-check-in-info",
  entryPoint,
  authenticate,
  ManageTime.findTotalCheckInTimeMonthly,
  exitPoint
);

module.exports = router;
