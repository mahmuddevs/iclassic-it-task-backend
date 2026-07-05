import { model, Schema } from "mongoose";
import type { IPermission } from "../types/model-types/permission.type.js";


const PermissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Permission = model<IPermission>("Permission", PermissionSchema);