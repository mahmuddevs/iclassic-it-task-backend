import { Document, Types } from "mongoose";
import type { IPermission } from "./permission.type.js";

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: Types.ObjectId[] | IPermission[];
}
