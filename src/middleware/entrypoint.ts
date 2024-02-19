import { NextFunction, Response, Request } from "express";
// import { logger } from "../config/log";
import uniqid from "uniqid";

/*
 *
 * @param req
 * @param res
 */
export function entryPoint(
  req: Request | any,
  res: Response | any,
  next: NextFunction
) {
  req.entryTimeStamp = new Date();
  req.txId = generateTransactionId();

  console.log(
    req.txId,
    ", EntryPoint, URL: " +
      req.originalUrl +
      ", Payload status: " +
      (req.body ? true : false) +
      ", Timestamp: " +
      req.entryTimeStamp
  );
  next();
  return;
}

export function generateTransactionId() {
  return uniqid("tx");
}
