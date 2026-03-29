import mongoose from "mongoose";
import { IUser } from "../types/index.js";

const userSchema =new mongoose.Schema<IUser>({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        trim:true
    },
    clerkId:{
        type:String,
        unique:true,
        sparse:true
    },
    role:{
        type:String,
        required:true,
        enum:["user","admin"],
        default:"user"

    }
},{timestamps:true})

const User =mongoose.model<IUser>("User",userSchema)

export default User;//here the user model store the data 