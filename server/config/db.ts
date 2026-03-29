import mongoose from "mongoose";

const dbConnect =async()=>{
    try {
        await mongoose.connection.on("connected",()=>{
            console.log("Database connected successfully")
        })
        await mongoose.connect(process.env.MONGODB_URL as string)
    } catch (error) {
        console.log("Database connection failed:",error)
    }
}

export default dbConnect