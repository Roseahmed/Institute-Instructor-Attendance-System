import { Document, Schema, Model, model } from "mongoose";
import bcrypt from "bcryptjs";

const saltRounds = 13;

export interface IUsers {
  name: string;
  email: string;
  mobile?: string;
  password: string;
  isEnabled?: boolean;
  isAdmin?: boolean;
  createdAt?: Date;
  lastUpdatedAt?: Date;
}

export interface IUsersModel extends IUsers, Document {}

const UsersSchema: Schema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true },
    mobile: { type: String },
    password: { type: String },
    isEnabled: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    bufferCommands: false,
    versionKey: false,
  }
);

export const UsersModel: Model<IUsersModel> = model<IUsersModel>(
  "users",
  UsersSchema,
  "users"
);

// Return a salted password the same way that is done for the database.
export var createSaltedPassword = function (
  password: string,
  callback: Function
) {
  if (password) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(password, salt, function (err1, hash) {
        callback(err1, hash);
      });
    });
  }
};

export var compareSaltedPassword = function (
  password: string,
  hash: string,
  callback: Function
) {
  bcrypt.compare(password, hash, function (err, isMatch) {
    callback(err, isMatch);
  });
};

export let create = function (obj: any, cb: Function) {
  createSaltedPassword(obj.password, function (err, hashedPassword) {
    if (err) {
      console.log(err);
      return;
    }
    obj.password = hashedPassword;
    UsersModel.insertMany([obj], {}, function (err: any, result: any) {
      cb(err, result);
    });
  });
};

export let findOne = async function (query: any) {
  return UsersModel.findOne(query);
};

export let findOneByQuery = function (query: any, cb: Function) {
  UsersModel.findOne(query, (err: any, result: any) => {
    cb(err, result);
  });
};

export let findById = function (id: any, cb: Function) {
  UsersModel.findOne({ _id: id }, (err: any, result: any) => {
    cb(err, result);
  });
};

export let updateOne = function (query: any, obj: any, cb: Function) {
  obj.lastUpdatedAt = Date.now();

  if (obj.password) {
    createSaltedPassword(obj.password, function (err, hashedPassword) {
      if (err) {
        console.log(err);
        return;
      }
      obj.password = hashedPassword;
      UsersModel.updateOne(
        query,
        { $set: obj },
        function (err: any, result: any) {
          cb(err, result);
        }
      );
    });
  } else {
    UsersModel.updateOne(
      query,
      { $set: obj },
      function (err: any, result: any) {
        cb(err, result);
      }
    );
  }
};

export let findAll = function (skip: number, limit: number, cb: Function) {
  UsersModel.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec(function (err: any, result: any) {
      cb(err, result);
    });
};

export let findMany = function (query: any) {
  return UsersModel.find(query);
};

export let search = function (
  text: any,
  skip: number,
  limit: number,
  cb: Function
) {
  UsersModel.find({
    $or: [
      { name: new RegExp(text, "i") },
      { email: new RegExp(text, "i") },
      { mobile: new RegExp(text, "i") },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec(function (err: any, result: any) {
      cb(err, result);
    });
};

export let count = async function (query: any) {
  return UsersModel.countDocuments(query);
};

export let countSearch = async function (text: any) {
  return UsersModel.countDocuments({
    $or: [
      { name: new RegExp(text, "i") },
      { email: new RegExp(text, "i") },
      { mobile: new RegExp(text, "i") },
    ],
  });
};

export let deleteUser = function (query: any, cb: Function) {
  UsersModel.deleteOne(query, function (err: any, result: any) {
    cb(err, result);
  });
};
