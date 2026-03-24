import mongoose from "mongoose";


export const connectDB = async () => {
    await mongoose.connect('mongodb://kavya:kavya%40123@ac-cl3uyw7-shard-00-00.ir98qry.mongodb.net:27017,ac-cl3uyw7-shard-00-01.ir98qry.mongodb.net:27017,ac-cl3uyw7-shard-00-02.ir98qry.mongodb.net:27017/?ssl=true&replicaSet=atlas-fpe1rs-shard-0&authSource=admin&appName=Cluster0').then(() => console.log("DB connected"));
}