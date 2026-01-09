import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { OAuth2Client } from "google-auth-library";

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Create JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

/* --------------------------------------------------
   NORMAL LOGIN
-------------------------------------------------- */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist",
      });
    }

    if (!user.password) {
      return res.json({
        success: false,
        message: "This email is registered with Google Login only.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const token = createToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};


/* --------------------------------------------------
   NORMAL REGISTER
-------------------------------------------------- */
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;

  try {
    const exists = await userModel.findOne({ email });

    if (exists) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be minimum 8 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};


/* --------------------------------------------------
   GOOGLE LOGIN
-------------------------------------------------- */
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        name,
        email,
        password: null,
      });
    }

    const token = createToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Google Login Failed" });
  }
};


/* --------------------------------------------------
   UPDATE NAME
-------------------------------------------------- */
const updateName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Name is required" });
    }

    const updated = await userModel.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* --------------------------------------------------
   UPDATE PASSWORD
-------------------------------------------------- */
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.json({ success: false, message: "Password is required" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const updated = await userModel.findByIdAndUpdate(
      userId,
      { password: hashedPass },
      { new: true }
    );

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* --------------------------------------------------
   DELETE ACCOUNT
-------------------------------------------------- */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await userModel.findByIdAndDelete(userId);

    res.json({ success: true, message: "Account deleted permanently" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  loginUser,
  registerUser,
  googleLogin,
  updateName,
  updatePassword,
  deleteAccount,
};