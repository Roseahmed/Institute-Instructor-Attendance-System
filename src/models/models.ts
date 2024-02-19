export const ErrorCodes = {
  // 10XX - Common errors
  1001: {
    message: "Missing mandatory input params",
    errorCode: 1001,
    statusCode: 400,
  },
  1002: {
    message: "Missing mandatory payload",
    errorCode: 1001,
    statusCode: 400,
  },
  1003: {
    message: "User Not Authorized",
    errorCode: 1003,
    statusCode: 400,
  },
  1004: {
    message: "Object Not Found",
    errorCode: 1004,
    statusCode: 404,
  },
  1005: {
    message: "Failed to create entry in DB",
    errorCode: 1005,
    statusCode: 500,
  },
  1006: {
    message: "Failed to update entry in DB",
    errorCode: 1006,
    statusCode: 500,
  },
  1007: {
    message: "Failed to find entry in DB",
    errorCode: 1007,
    statusCode: 500,
  },
  1008: {
    message: "Failed to delete entry in DB",
    errorCode: 1008,
    statusCode: 500,
  },
  1009: {
    message: "User Not Authorized",
    errorCode: 1009,
    statusCode: 400,
  },
  1010: {
    message: "Failed to Add Users",
    errorCode: 1010,
    statusCode: 500,
  },
  1011: {
    message: "Validation Failed: Email is Required",
    errorCode: 1011,
    statusCode: 500,
  },
  1012: {
    message: "Unknown DB error",
    errorCode: 1012,
    statusCode: 500,
  },
  1013: {
    message: "Invalid ObjectId",
    errorCode: 1013,
    statusCode: 400,
  },
  1014: {
    message: "Server Internel error",
    errorCode: 1014,
    statusCode: 500,
  },
  1015: {
    message: "Invalid Credentials!",
    errorCode: 1015,
    statusCode: 400,
  },
  1016: {
    message: "Falied to append Middleware",
    errorCode: 1016,
    statusCode: 500,
  },
};

export class ResponseObj {
  public status: number;
  public message: string;
  public data: any;

  constructor(status: number, message: string, data: any) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  public toJson() {
    return { status: this.status, message: this.message, data: this.data };
  }

  public toJsonString() {
    return JSON.stringify({
      status: this.status,
      message: this.message,
      data: this.data,
    });
  }
}
