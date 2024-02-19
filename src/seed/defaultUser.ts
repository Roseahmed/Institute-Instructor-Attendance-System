import * as Users from "../models/users";
import { Config } from "../config/config";

const config = new Config();

export async function addDefaultUser() {
  try {
    let userData: Users.IUsers = {
      name: config.name,
      email: config.email,
      password: config.password,
      isAdmin: true,
    };
    console.log("Default user info:", userData);

    // Check for duplicate entries
    const exisitngData = await Users.findOne({
      email: userData.email,
    });

    if (exisitngData) {
      console.log("User already exist");
      return;
    }

    Users.create(userData, (err: any, result: any) => {
      if (err || !result) {
        console.log("Failed to create user: ", err?.message);
        return;
      }
      console.log("User created successfully");
    });
  } catch (error: any) {
    console.log("Add User error:", error?.message);
  }
}
