import { Request, Response, NextFunction } from "express";
import { ObjectId } from "bson";
import { ErrorCodes } from "../models/models";
import * as Attendance from "../models/manage-attendance";
import * as Users from "../models/users";

export const addTimeInAndOut = async function (
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req?.user?._id;
    // check-in time and check-out should be in ISO format.
    let { checkInTime, checkOutTime } = req.body;
    // Todo: validate payload format

    if (!Object.keys(req.body)?.length) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        customMsg: "Paylod empty",
        data: {},
      };
      next();
      return;
    }

    let options = {
      sort: {
        createdAt: -1,
      },
    };

    let latestTimeInfo: any = await Attendance.findOne(
      { userId: new ObjectId(userId) },
      {},
      options
    );

    let currentTime = new Date().getTime();

    if (checkInTime) {
      // Don't allow multiple check-in at the same time
      if (
        latestTimeInfo &&
        latestTimeInfo?.checkIn &&
        (!latestTimeInfo?.checkOut || latestTimeInfo?.checkOut == null)
      ) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          customMsg: "You are already checked-in, please checkout",
          data: {},
        };
        next();
        return;
      }

      // check-in time shouldn't be greater then current time
      let checkInTimeInMill = new Date(checkInTime).getTime();
      if (checkInTimeInMill > currentTime) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          customMsg: "Check-in time should be less or equal to current time",
          data: {},
        };
        next();
        return;
      }
      // check for overlap condition
      let isOverlap: boolean = await isCheckInTimeOverLap(userId, checkInTime);
      if (isOverlap) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          customMsg:
            "Check-in time is overlaping, please check the check-in time",
          data: {},
        };
        next();
        return;
      }

      let data: Attendance.IAttendance = {
        userId: userId,
        checkIn: new Date(checkInTime),
        checkOut: null,
      };

      let result: any = await Attendance.create(data);
      if (!result?.length) {
        throw new Error("Something went wrong");
      }

      req.apiStatus = {
        isSuccess: true,
        customMsg: "Checked-in successfully",
        data: result[0],
      };
      next();
      return;
    }

    if (checkOutTime) {
      const checkOutTimeInMilli = new Date(checkOutTime).getTime();
      // checkout shouldn't be greater then current time
      if (checkOutTimeInMilli > currentTime) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          customMsg: "Check-out time should be less then equal to current time",
          data: {},
        };
        next();
        return;
      }

      // Should check-in first
      if (!latestTimeInfo) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          customMsg: "Please check-in to check-out",
          data: {},
        };
        next();
        return;
      } else if (
        latestTimeInfo &&
        latestTimeInfo?.checkIn &&
        latestTimeInfo?.checkOut
      ) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          customMsg: "You have already checked-out, please check-in",
          data: {},
        };
        next();
        return;
      }

      // check-out shouldn't be greater than check-in time
      if (latestTimeInfo?.checkIn) {
        let checkInTimeInMill = new Date(latestTimeInfo?.checkIn).getTime();
        if (checkOutTimeInMilli <= checkInTimeInMill) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1002],
            customMsg:
              "Check-out time can't be less than equal to check-in time",
            data: {},
          };
          next();
          return;
        }
      }
      let isOverlap: boolean = await isCheckOutTimeOverLap(
        userId,
        checkOutTime
      );
      if (isOverlap) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          customMsg:
            "Check-out time is overlaping, please check the check-out time",
          data: {},
        };
        next();
        return;
      }

      let updateData = {
        checkOut: new Date(checkOutTime),
      };

      let updateResult: any = await Attendance.updateOne(
        { _id: latestTimeInfo?._id },
        updateData
      );

      req.apiStatus = {
        isSuccess: true,
        customMsg: "Check-out successfully",
        data: updateResult,
      };
      next();
      return;
    }
  } catch (err: any) {
    console.log("error:", err);
    console.log("Add time in or time out error:", err?.message);
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1003],
      customMsg: err?.message,
      data: {},
    };
    next();
    return;
  }
};

export const findTotalCheckInTimeMonthly = async function (
  req: Request | any,
  res: Response | any,
  next: NextFunction
) {
  try {
    let { year, month } = req.body;
    req.checkBody("year", "year is requried").notEmpty();
    req.checkBody("month", "month is required").notEmpty();
    const error = req.validationErrors();
    if (error) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1002],
        customMsg: error[0]?.msg,
        data: {},
      };
      next();
      return;
    }

    let date = new Date(year + "/" + month + "/" + 1);
    const getYear = date.getFullYear();
    const getMonth = date.getMonth();

    let startOfTheMonth = new Date(getYear, getMonth, 1);
    let endOfTheMonth = new Date(
      new Date(getYear, getMonth + 1, 0).setHours(23, 59, 59, 999)
    );

    let checkInInfoAllInstructor: any = [];
    // find all the instructor
    let allInstructor: any = await Users.findMany({});
    if (allInstructor?.length) {
      for (let i = 0; i < allInstructor?.length; i++) {
        const instructor = allInstructor[i];
        let query = {
          $and: [
            { userId: new ObjectId(instructor?._id) },
            { checkIn: { $gte: startOfTheMonth } },
            { checkOut: { $lte: endOfTheMonth } },
          ],
        };

        let docs: any = await Attendance.findMany(query, {}, {});
        let totalTimeInMilli = 0;
        let checkInInfoByInstructor = {
          _id: instructor?._id,
          name: instructor?.name,
        };
        if (docs?.length) {
          for (let k = 0; k < docs?.length; k++) {
            let eachDocs = docs[k];

            if (eachDocs?.checkIn && eachDocs?.checkOut) {
              let checkIn = new Date(eachDocs?.checkIn).getTime();
              let checkOut = new Date(eachDocs?.checkOut).getTime();
              totalTimeInMilli += Math.abs(checkOut - checkIn);
            }
          }
        }
        checkInInfoByInstructor["totalCheckInTime"] = totalTimeInMilli;
        checkInInfoAllInstructor.push(checkInInfoByInstructor);
      }
    }

    req.apiStatus = {
      isSuccess: true,
      data: checkInInfoAllInstructor,
    };
    next();
    return;
  } catch (err: any) {
    console.log("Find total check-in time by instructor error:", err?.message);
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1005],
      customMsg: err?.message,
      data: {},
    };
    next();
    return;
  }
};

// helper function
async function isCheckInTimeOverLap(
  userId: string,
  checkInTime: string
): Promise<boolean> {
  try {
    let isOverlap: boolean = false;

    let day = new Date(checkInTime); // find the day from checkInTime
    let startOfDay = new Date(new Date(day).setHours(0, 0, 0, 0));
    let endOfDay = new Date(new Date(day).setHours(23, 59, 59, 999));
    let findAllCheckIn = {
      $and: [
        { userId: new ObjectId(userId) },
        { checkIn: { $gte: startOfDay } },
        { checkIn: { $lte: endOfDay } },
      ],
    };

    let documents: any = await Attendance.findMany(findAllCheckIn, {}, {});
    if (documents?.length) {
      let payloadCheckInTime = new Date(checkInTime).getTime();
      for (let i = 0; i < documents?.length; i++) {
        let eachDocs = documents[i];

        let docCheckInTime = new Date(eachDocs?.checkIn).getTime();
        let docCheckOutTime = new Date(eachDocs?.checkOut).getTime();

        if (
          payloadCheckInTime >= docCheckInTime &&
          payloadCheckInTime < docCheckOutTime
        ) {
          isOverlap = true;
          break;
        }
      }
      return isOverlap;
    }
    return isOverlap;
  } catch (err) {
    throw err;
  }
}

async function isCheckOutTimeOverLap(
  userId: string,
  checkOutTime: string
): Promise<boolean> {
  try {
    let isOverlap: boolean = false;

    let day = new Date(checkOutTime); // find the day from checkInTime
    let startOfDay = new Date(new Date(day).setHours(0, 0, 0, 0));
    let endOfDay = new Date(new Date(day).setHours(23, 59, 59, 999));
    let findAllCheckIn = {
      $and: [
        { userId: new ObjectId(userId) },
        { checkIn: { $gte: startOfDay } },
        { checkIn: { $lte: endOfDay } },
      ],
    };

    let documents: any = await Attendance.findMany(findAllCheckIn, {}, {});
    if (documents?.length) {
      let payloadCheckOutTime = new Date(checkOutTime).getTime();
      for (let i = 0; i < documents?.length; i++) {
        let eachDocs = documents[i];

        let docCheckInTime = new Date(eachDocs?.checkIn).getTime();
        let docCheckOutTime = new Date(eachDocs?.checkOut).getTime();
        if (
          payloadCheckOutTime >= docCheckInTime &&
          payloadCheckOutTime <= docCheckOutTime
        ) {
          isOverlap = true;
          break;
        }
      }
      return isOverlap;
    }
    return isOverlap;
  } catch (err) {
    throw err;
  }
}
