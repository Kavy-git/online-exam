import express from "express";
import { googleLogin } from "../controllers/googleAuthController.js";

import {
  loginUser,
  registerUser,
  googleLogin,
  updateName,
  updatePassword,
  deleteAccount,
} from "../controllers/userController.js";

import { auth } from "../middlewares/auth.js";

const router = express.Router();

// 🔐 Normal Login
router.post("/login", loginUser);

// 📝 Register
router.post("/register", registerUser);

// 🔵 Google Login
router.post("/google", googleLogin);

// ✏ Update Name
router.put("/update-name", auth, updateName);

// 🔑 Update Password
router.put("/update-password", auth, updatePassword);

// ❌ Delete Account
router.delete("/delete", auth, deleteAccount);

export default router;
