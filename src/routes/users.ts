import express from "express";
import passport from "passport";
import { entryPoint } from "../middleware/entrypoint";
import { exitPoint } from "../middleware/exitpoint";
import * as Users from "../controllers/users";
import { checkPermission } from "../middleware/permissions";

const router = express.Router();
const authenticate = passport.authenticate("bearer", { session: false });
// signup
router.post("/sign-up", entryPoint, Users.add, exitPoint);

router.put(
  "/update/:id",
  entryPoint,
  authenticate,
  checkPermission,
  Users.edit,
  exitPoint
);

router.get(
  "/find-one/:id",
  entryPoint,
  authenticate,
  checkPermission,
  Users.findById,
  exitPoint
);

router.get(
  "/find",
  entryPoint,
  authenticate,
  checkPermission,
  Users.find,
  exitPoint
);

router.delete(
  "/delete-one/:id",
  entryPoint,
  authenticate,
  checkPermission,
  Users.deleteUser,
  exitPoint
);

module.exports = router;
