import { clerkClient } from "@clerk/express";
import User from "../models/User.js";
import { IUser } from "../types/index.js";
import { Request,Response } from "express";

const makeAdmin =async()=>{
   try {
    const email =process.env.ADMIN_EMAIL;
    const user =await User.findOneAndUpdate({email},{role:"admin"});//here we that already created user updated

    if(user){
        await clerkClient.users.updateUserMetadata(user.clerkId as string,{publicMetadata:{role:"admin"}});
        //here we update the role of the user in the clerk as well of that email id of the user
    }

   } catch (error:any) {
       console.error("Admin promotion failed:",error.message)
   }

}


export default makeAdmin;//here we
