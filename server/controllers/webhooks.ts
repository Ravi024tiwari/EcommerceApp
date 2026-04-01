import { verifyWebhook } from "@clerk/express/webhooks"
import { Request,Response } from "express"
import User from "../models/User.js";

export const clerkWebhook =async (req:Request, res:Response) => {
  try {
    const evt = await verifyWebhook(req);//here we recieve the data when new user created or updated

    if(evt.type==='user.created' || evt.type==='user.updated'){
        const user= await User.findOne({clerkId:evt.data.id});//here we get the modified user

        const userData ={
            clerkId:evt.data.id,
            email:evt.data?.email_addresses[0]?.email_address,
            name:evt.data.first_name +" "+evt.data.last_name,
            image:evt.data.image_url,
        }

        if(user){
            await User.findOneAndUpdate({clerkId:evt.data.id},userData)
        }else{
            await User.create(userData);//here the new entry of user created on the web hook and mongodb
        }
    }
    return res.json({
        success:true,
        message:"WebHook recieved"
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return res.status(400).send('Error verifying webhook')
  }
}