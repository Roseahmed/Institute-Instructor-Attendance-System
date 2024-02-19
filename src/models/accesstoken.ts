import { Document, Schema, Model, model } from "mongoose";
import { ObjectId } from "bson";

export const TOKEN_EXPIRY: number = 60 * 60 * 2; // 2 hours in seconds

export interface IAccessToken {
  token: string;
  userId: Schema.Types.ObjectId;
  createdAt?: Date;
}

export interface IAccessTokenModel extends IAccessToken, Document {}

const AccessTokenSchema: Schema = new Schema(
  {
    token: {
      type: String,
      index: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: TOKEN_EXPIRY,
    },
  },
  {
    bufferCommands: false,
    versionKey: false,
  }
);

export const AccessTokenModel: Model<IAccessTokenModel> =
  model<IAccessTokenModel>("access-tokens", AccessTokenSchema, "access-tokens");

export let updateToken = function (
  token: string,
  userId: string,
  cb: Function
) {
  let tokenObj = new AccessTokenModel({ token, userId });
  AccessTokenModel.insertMany([tokenObj], {}, function (err: any, user: any) {
    cb(err, user);
  });
};

export let findByToken = function (token: string, cb: Function) {
  AccessTokenModel.findOne({ token }, function (err: any, result: any) {
    cb(err, result);
  });
};

export let deleteToken = function (userId: string | any, cb: Function) {
  userId = new ObjectId(userId);
  AccessTokenModel.deleteMany({ userId }, {}, (err: any) => {
    cb(err);
  });
};
