import { OAuth2Client } from "google-auth-library";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;

    // Check if user exists
    let user = await userModel.findOne({ email });

    // If not, create user
    if (!user) {
      user = new userModel({
        name,
        email,
        password: "google_auth", // dummy password
      });

      await user.save();
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user,
    });

  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Google login failed",
    });
  }
};