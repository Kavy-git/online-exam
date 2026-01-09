import mongoose from "mongoose";


export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://rohini:roh2004@cluster0.7fnlqoj.mongodb.net/EXAM').then(() => console.log("DB connected"));
}