import mongoose from "mongoose";
import {ApiError} from "../utils/ApiError.js";

export const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Database Connected");
    })
    .catch((err) => {
      throw new ApiError(500, `${err.message}`);
    });
};
