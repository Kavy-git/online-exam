import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, default: null },  // email users only

    googleId: { type: String, default: null },  // Google users only

    picture: { type: String, default: null },   // For Google profile image

    loginType: { type: String, default: "email" },  
    // "email" or "google"

    

    createdAt: { type: Date, default: Date.now }
});


const userModel = mongoose.models.user || mongoose.model("user",userSchema);
export default userModel;
