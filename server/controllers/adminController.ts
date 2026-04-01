import { Request, Response } from "express";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";


//get adminDashboard stats


export const getDashboardStats =async(req:Request,res:Response)=>{
    try {
        const totalUsers =await User.countDocuments();
        const totalProducts =await Product.countDocuments();
        const totalOrders =await Order.countDocuments();

        const validOrders =await Order.find({orderStatus:{$ne:'cancelled'}});//here we get all the valid orders 
        const totalRevenue =validOrders.reduce((sum,order)=>sum +order.totalAmount,0);//here we get all the revenue of all the valid orders

        const recentOrders = await Order.find().sort("-createdAt").limit(5).populate("user","name email")

        return res.status(200).json({
            success:true,
            message:"Admin dashboard fetched successfully..",
            data:{
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                recentOrders
            }
        })
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}