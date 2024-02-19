import { Response, Request, NextFunction } from "express";
import { ErrorCodes } from "../models/models";
import { ObjectId } from "bson";
import * as Users from "../models/users";

export async function add(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate input parameters
    req.checkBody("name", "name is missing").notEmpty();
    req.checkBody("email", "email is missing").notEmpty();
    req.checkBody("password", "password is missing").notEmpty();

    const error = req.validationErrors();

    if (error) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1001],
        customMsg: error[0]?.msg,
        data: {},
      };
      next();
      return;
    }

    let userData: Users.IUsers = req.body;
    delete userData.isAdmin; // remove admin access

    // Check for duplicate entries
    const exisitngData = await Users.findOne({
      email: userData.email,
    });

    if (exisitngData) {
      console.log(req.txId, "Duplicate data", exisitngData);
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1008],
        data: {},
      };
      next();
      return;
    }

    Users.create(userData, (err: any, result: any) => {
      if (err || !result) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1002],
          data: {},
        };
      } else {
        req.apiStatus = {
          isSuccess: true,
          customMsg: "User Added",
          data: result[0],
        };
      }
      next();
      return;
    });
  } catch (error: any) {
    console.log("Add User error:", error?.message ?? error);

    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1012],
      customMsg: error?.message ?? error,
      data: {},
    };
    next();
  }
}

export async function edit(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    let userId = req.params.id;

    let userData: any = req.body;

    const exisitngUser: any = await Users.findMany({
      email: userData.email,
    });

    if (exisitngUser?.length >= 1) {
      console.log("exisitngUserupdate", exisitngUser);
      let existEntry: any = exisitngUser[0];
      if (existEntry && existEntry._id && String(existEntry._id) != userId) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1006],
          customMsg: "User already exists",
          data: "User Update Failed",
        };
        next();
        return;
      }
    }

    Users.updateOne({ _id: userId }, userData, (err: any, result: any) => {
      if (err || !result) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1007],
          data: {},
        };
      } else if (
        result &&
        result.matchedCount < 1 &&
        result.modifiedCount < 1
      ) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1004],
          data: {},
        };
      } else {
        req.apiStatus = {
          isSuccess: true,
          data: "User Updated",
        };
      }
      next();
      return;
    });
  } catch (error: any) {
    console.log("Edit User error:", error?.message ?? error);

    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1012],
      customMsg: error?.message ?? error,
      data: {},
    };
    next();
  }
}

export async function findById(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    let userId = req.params.id;

    if (!ObjectId.isValid(userId)) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1013],
        data: {},
      };
      next();
      return;
    }

    const user = await Users.findOne({ _id: new ObjectId(userId) });
    req.apiStatus = {
      isSuccess: true,
      data: user,
    };
    next();
  } catch (error: any) {
    console.log("Get User error:", error?.message ?? error);

    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1012],
      customMsg: error?.message ?? error,
      data: {},
    };
    next();
  }
}

export async function find(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    let { searchText = null, page = 1, limit = 15 } = req.query;
    let skip: number = 0;

    if (page && limit) {
      page = parseInt(page);
      limit = parseInt(limit);

      skip = (page - 1) * limit;
    }

    // let searchText = req.params.searchText;

    if (searchText) {
      Users.search(searchText, skip, limit, async (err: any, result: any) => {
        if (err || !result) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1003],
            data: {},
          };
        } else {
          const total = await Users.countSearch(searchText);
          req.apiStatus = {
            isSuccess: true,
            data: {
              documentsCount: total,
              documents: result,
            },
          };
        }
        next();
      });
    } else {
      Users.findAll(skip, limit, async (err: any, result: any) => {
        if (err || !result) {
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1003],
            data: {},
          };
        } else {
          const total = await Users.count({});
          req.apiStatus = {
            isSuccess: true,
            data: {
              documentsCount: total,
              documents: result,
            },
          };
        }
        next();
      });
    }
  } catch (error: any) {
    console.log("Get Users error:", error?.message ?? error);

    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1012],
      customMsg: error?.message ?? error,
      data: {},
    };
    next();
  }
}

export async function deleteUser(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    let userId = req.params.id;
    if (!userId) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1001],
        customMsg: "Invalid object id: " + userId,
        data: {},
      };
      next();
      return;
    }

    if (!ObjectId.isValid(userId)) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1013],
        data: {},
      };
      next();
      return;
    }

    Users.deleteUser({ _id: userId }, (err: any, result: any) => {
      if (err || !result) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1005],
          data: {},
        };
      } else if (result && result.deletedCount < 1) {
        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1004],
          data: {},
        };
      } else {
        req.apiStatus = {
          isSuccess: true,
          data: "User Deleted",
        };
      }
      next();
      return;
    });
  } catch (error: any) {
    console.log("Delete User error:", error?.message ?? error);

    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1012],
      customMsg: error?.message ?? error,
      data: {},
    };
    next();
  }
}
