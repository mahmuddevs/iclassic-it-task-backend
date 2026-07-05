import type { IPermission } from "./model-types/permission.type.js";

export interface IAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: Pick<IPermission, "name" | "module">[];
}
