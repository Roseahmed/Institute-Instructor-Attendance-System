import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import moment from "moment";
import { ErrorCodes } from "../models/models";
import * as Users from "../models/users";
import * as AccessToken from "../models/accesstoken";

export async function login(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  try {
    // Validate input parameters
    req.checkBody("username", "username is missing").notEmpty();
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

    var username = req.body.username;
    var password = req.body.password;

    Users.findOneByQuery({ email: username }, function (err: Error, user: any) {
      if (err || !user) {
        console.log(req.txId, "User not found: " + username);

        req.apiStatus = {
          isSuccess: false,
          error: ErrorCodes[1004],
          data: {},
        };
        next();
        return;
      } else {
        if (user.password !== "") {
          Users.compareSaltedPassword(
            password,
            user.password,
            function (pwdErr: Error, isMatch: boolean) {
              if (isMatch) {
                let userJson: any = JSON.stringify(user);
                userJson = JSON.parse(userJson);

                generateAndSaveAccessToken(
                  req,
                  userJson,
                  function (accessToken: string, expiresAt: Date) {
                    if (!accessToken || !expiresAt) {
                      console.log(req.txId, "AccessToken generation failure");
                      req.apiStatus = {
                        isSuccess: false,
                        error: ErrorCodes[1014],
                        data: "A Token generation failure",
                      };
                      next();
                      return;
                    }

                    delete userJson.password;
                    userJson.access_token = accessToken;
                    userJson.tokenExpiresAt = expiresAt;

                    req.apiStatus = {
                      isSuccess: true,
                      data: userJson,
                    };
                    next();
                    return;
                  }
                );
              } else {
                console.log(req.txId, "Incorrect Password for", username);

                req.apiStatus = {
                  isSuccess: false,
                  error: ErrorCodes[1015],
                  data: {},
                };
                next();
                return;
              }
            }
          );
        } else {
          console.log(req.txId, "Password cannot be empty", username);

          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1015],
            data: {},
          };
          next();
          return;
        }
      }
    });
  } catch (e) {
    console.log(req.txId, "Unhandled exception!!!");
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: {},
    };
    next();
    return;
  }
}

export async function logout(req: any, res: any, next: NextFunction) {
  try {
    const user = req.user;
    let userJson: any = JSON.stringify(user);
    userJson = JSON.parse(userJson);

    req.apiStatus = {
      isSuccess: true,
      data: "Success",
    };
    next();

    deleteAccessToken(req, userJson);
  } catch (e) {
    console.log(req.txId, "Unhandled exception!!!");
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1014],
      data: {},
    };
    next();
    return;
  }
}

export async function getUser(req: any, res: any, next: NextFunction) {
  try {
    const user = req.user;
    let userJson: any = JSON.stringify(user);
    userJson = JSON.parse(userJson);
    delete userJson.password;

    req.apiStatus = {
      isSuccess: true,
      data: userJson,
    };
    next();
    return;
  } catch (e) {
    console.log(req.txId, "Unhandled exception!!!");
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: {},
    };
    next();
    return;
  }
}

export async function changePassword(req: any, res: any, next: NextFunction) {
  try {
    // Validate input parameters
    req.checkBody("oldPassword", "oldPassword is missing").notEmpty();
    req.checkBody("newPassword", "newPassword is missing").notEmpty();
    req.checkBody("reNewPassword", "reNewPassword is missing").notEmpty();

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

    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    let reNewPassword = req.body.reNewPassword;

    if (newPassword !== reNewPassword) {
      req.apiStatus = {
        isSuccess: false,
        error: ErrorCodes[1001],
        customMsg: "Passwords do not match!!",
        data: {},
      };
      next();
      return;
    }

    Users.compareSaltedPassword(
      oldPassword,
      req.user.password,
      (pwdErr: Error, isMatch: boolean) => {
        console.log(pwdErr, isMatch);
        if (pwdErr || !isMatch) {
          console.log(req.txId, "Password valdiation failed");
          req.apiStatus = {
            isSuccess: false,
            error: ErrorCodes[1015],
            data: {},
          };
          next();
          return;
        }

        Users.updateOne(
          { _id: req.user.id },
          { password: newPassword },
          (err: any, result: any) => {
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
                data: "Password updated successfully",
              };
            }

            next();
            return;
          }
        );
      }
    );
  } catch (e) {
    console.log(req.txId, "Unhandled exception!!!");
    req.apiStatus = {
      isSuccess: false,
      error: ErrorCodes[1001],
      data: {},
    };
    next();
    return;
  }
}

/************** Helper Functions ******************/
const jwtSecret = "go6o9ZHh95z6nqN67v";
function generateAndSaveAccessToken(req: any, user: any, cb: Function) {
  let token = jwt.sign({ userId: user._id }, jwtSecret, {
    expiresIn: AccessToken.TOKEN_EXPIRY,
  });

  AccessToken.updateToken(token, user._id, function (err: Error, result: any) {
    if (err || !result) {
      console.log(req.txId, "Error saving token", err);
      cb(null, null);
    } else {
      console.log(req.txId, "Access Token details", result);
      let expiresAt = moment(result.createdAt)
        .add(AccessToken.TOKEN_EXPIRY, "m")
        .utc();
      cb(token, expiresAt);
    }
  });
}

function deleteAccessToken(req: any, user: any) {
  AccessToken.deleteToken(user._id, function (err: Error) {
    if (err) {
      console.log(req.txId, "Error deleting token", err);
    }
  });
}
