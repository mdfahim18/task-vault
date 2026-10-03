import { model, Schema } from "mongoose";

const userShema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: [50, "name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "please provide your valid email"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model("User", userShema);
