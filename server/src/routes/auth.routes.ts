import express from "express";
import {
  getMe,
  loginUser,
  logoutUser,
  refreshTokenController,
  registerUser,
} from "../controller/authController";
import { authMiddleware } from "../middlewares/authMiddlewares";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/refresh-token", refreshTokenController);
authRouter.post("/logout", authMiddleware, logoutUser);
authRouter.get("/me", authMiddleware, getMe);

//

export default authRouter;
