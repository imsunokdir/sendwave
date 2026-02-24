import express from "express";
import {
  changePassword,
  getMe,
  loginUser,
  logoutUser,
  refreshTokenController,
  registerUser,
  updateProfile,
} from "../controller/authController";
import { authMiddleware } from "../middlewares/authMiddlewares";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/refresh-token", refreshTokenController);
authRouter.post("/logout", authMiddleware, logoutUser);
authRouter.get("/me", authMiddleware, getMe);

// Update profile (name, email)
authRouter.patch("/update-profile", authMiddleware, updateProfile);

// Change password
authRouter.patch("/change-password", authMiddleware, changePassword);

// Delete account
// authRouter.delete("/delete-account", authMiddleware, deleteAccount);

export default authRouter;
