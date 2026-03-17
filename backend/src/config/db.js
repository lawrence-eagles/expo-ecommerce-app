import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const connect = await mongoose.connect(ENV.DB_URL);
    console.log(`Connected to MongoDB ${connect.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error`);
    process.exit(1); // exit code 1 means failure, 0 means success
  }
};
