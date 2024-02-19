import { Document, Schema, Model, model } from "mongoose";
import { ObjectId } from "bson";

export interface IAttendance {
  userId: ObjectId;
  checkIn: Date | null;
  checkOut: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAttendanceModel extends IAttendance, Document {}

const AttendanceSchema: Schema = new Schema(
  {
    userId: {
      type: ObjectId,
      index: true,
      required: true,
    },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
  },
  {
    versionKey: false,
    bufferCommands: false,
    timestamps: true,
  }
);

const AttendanceModel: Model<IAttendanceModel> = model<IAttendanceModel>(
  "manage-attendance",
  AttendanceSchema,
  "manage-attendance"
);

export let create = async function (obj: any, cb?: Function) {
  if (cb) {
    AttendanceModel.insertMany([obj], {}, function (err: any, result: any) {
      cb(err, result);
    });
  } else {
    return new Promise((resolve, reject) => {
      AttendanceModel.insertMany([obj], {}, function (err: any, result: any) {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
};

export let findOne = async function (
  query: object | any,
  projection: object | Array<string> | string,
  options: object,
  cb?: Function
) {
  if (cb) {
    AttendanceModel.findOne(
      query,
      projection,
      options,
      (err: any, document: any) => {
        if (err) {
          cb(err, null);
          return;
        }
        document = JSON.parse(JSON.stringify(document));
        cb(null, document);
      }
    );
  } else {
    return new Promise((resolve, reject) => {
      AttendanceModel.findOne(
        query,
        projection,
        options,
        (err: any, document: any) => {
          if (err) {
            reject(err);
            return;
          }
          document = JSON.parse(JSON.stringify(document));
          resolve(document);
        }
      );
    });
  }
};

export const updateOne = async function (
  filter: object,
  data: object,
  cb?: Function
) {
  if (cb) {
    AttendanceModel.updateOne(
      filter,
      data,
      { upsert: false },
      (err: any, status: any) => {
        if (status?.modifiedCount > 0) {
          cb(null, status);
        } else if (status?.matchedCount === 0) {
          err = "Document not found";
          cb(err, null);
        } else {
          cb(err, null);
        }
      }
    );
  } else {
    return new Promise((resolve, reject) => {
      AttendanceModel.updateOne(
        filter,
        data,
        { upsert: false },
        (err: any, status: any) => {
          if (status?.modifiedCount > 0) {
            resolve(status);
          } else if (status?.matchedCount === 0) {
            err = "Document not found";
            reject(err);
          } else {
            reject(err);
          }
        }
      );
    });
  }
};

export const findMany = async function (
  filter: object,
  projections: object | Array<string> | string,
  options: object,
  cb?: Function
) {
  if (cb) {
    AttendanceModel.find(
      filter,
      projections,
      options,
      (err: any, documents: any) => {
        if (err) {
          cb(err, null);
          return;
        }
        documents = JSON.parse(JSON.stringify(documents));
        cb(null, documents);
      }
    );
  } else {
    return new Promise((resolve, reject) => {
      AttendanceModel.find(
        filter,
        projections,
        options,
        (err: any, documents: any) => {
          if (err) {
            reject(err);
            return;
          }
          documents = JSON.parse(JSON.stringify(documents));
          resolve(documents);
        }
      );
    });
  }
};
