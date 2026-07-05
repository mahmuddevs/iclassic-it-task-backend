import { model, Schema } from "mongoose";
import type { IRole } from "../types/model-types/role.type.js";


const RoleSchema = new Schema<IRole>(
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
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Role = model<IRole>("Role", RoleSchema);