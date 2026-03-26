import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import { googleLogin } from "../controllers/googleAuthController.js";

const router = express.Router();

// Normal login
router.post("/login", loginUser);

// Register
router.post("/register", registerUser);

// Google login
router.post("/google", googleLogin);

export default router;