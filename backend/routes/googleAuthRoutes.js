import express from "express";
import { googleLogin } from "../controllers/googleAuthController.js";

const router = express.Router();

app.use("/api/user", googleAuthRoutes);

export default router;