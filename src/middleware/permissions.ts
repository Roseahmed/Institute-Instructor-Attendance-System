import { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../models/models";
import { exitPoint } from "./exitpoint";

export const checkPermission = async function (
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    const isAdmin: boolean = req?.user?.isAdmin;
    if (!isAdmin) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1003],
        customMsg: "User unauthorised",
        data: {},
      };
      exitPoint(req, res);
      return;
    }
    next();
    return;
  } catch (err: any) {
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1006],
      customMsg: err?.message,
      data: {},
    };
    next();
    return;
  }
};
