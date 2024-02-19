import express from "express";
import passport from "passport";
import { entryPoint } from "../middleware/entrypoint";
import { exitPoint } from "../middleware/exitpoint";
import * as Auth from "../controllers/auth";

const router = express.Router();
const authenticate = passport.authenticate("bearer", { session: false });

router.post("/login", entryPoint, Auth.login, exitPoint);

router.get("/logout", entryPoint, authenticate, Auth.logout, exitPoint);

router.get("/user", entryPoint, authenticate, Auth.getUser, exitPoint);

router.post(
  "/change-password",
  entryPoint,
  authenticate,
  Auth.changePassword,
  exitPoint
);

module.exports = router;
