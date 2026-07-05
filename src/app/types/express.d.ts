import type { IAuthUser } from "../types/auth.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
    }
  }
}
