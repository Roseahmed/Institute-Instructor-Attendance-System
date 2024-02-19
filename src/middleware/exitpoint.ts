import { Response } from "express";
// import { logger } from "../config/log";
import { ResponseObj } from "../models/models";

/*
 * @param req
 * @param res
 */
export function exitPoint(req: any, res: Response) {
  console.log(
    req.txId,
    "exitPoint: " +
      (req.apiStatus.isSuccess
        ? "Success"
        : "Failed (" +
          req.apiStatus.error.errorCode +
          "), Err: " +
          (JSON.stringify(req.apiStatus.customMsg) || req.apiStatus.data))
  );
  let currentTime: any = new Date();

  let responseTime: string | any;
  if (req?.entryTimeStamp) {
    responseTime = Math.abs(currentTime - req?.entryTimeStamp);
    responseTime = responseTime + " MS";
  }

  if (req.apiStatus.isSuccess) {
    let responseObj = new ResponseObj(
      200,
      req.apiStatus.customMsg ? req.apiStatus.customMsg : "Success",
      req.apiStatus.data
    );
    responseObj["errorCode"] = null;
    responseObj["responseTime"] = responseTime;

    res.status(responseObj.status).json(responseObj);
  } else {
    let responseObj = new ResponseObj(
      req.apiStatus.error.statusCode,
      req.apiStatus.customMsg
        ? req.apiStatus.customMsg
        : req.apiStatus.error.message,
      req.apiStatus.data
    );
    responseObj["errorCode"] = req?.apiStatus?.error?.errorCode || null;
    responseObj["responseTime"] = responseTime;
    res.status(responseObj.status).json(responseObj);
  }
}
