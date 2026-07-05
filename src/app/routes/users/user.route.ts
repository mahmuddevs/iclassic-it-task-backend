import { Router } from "express";
import { authorize } from "../../middlewares/authorize.middleware.js";

const userRoutes = Router();

userRoutes.get("/", authorize("users.read"), (req, res) => {
  res.send("Users list");
});

export default userRoutes;