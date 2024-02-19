require("dotenv").config();

export class Config {
  serviceName = process.env.SERVICE_NAME || "Instructor attendance system";
  port = process.env.PORT || "8000";
  mongoDbUri =
    process.env.MONGO_URI_DB || "mongodb://127.0.0.1:27017/Attendance-system";

  name = process.env.NAME || "Admin";
  email = process.env.EMAIL || "instructor@gmail.com";
  password = process.env.PASSWORD || "Admin@123";
}
