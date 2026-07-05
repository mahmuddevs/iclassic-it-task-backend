import { Schema, model } from "mongoose";
import { hashData } from "../utils/hashUtils.js";
import type { IUser } from "../types/model-types/user.type.js";

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      default: "Employee",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) {
    return;
  }
  this.password = await hashData(this.password);
});

export const User = model<IUser>("User", UserSchema);