import { Request, Response } from "express";
import Order from "../models/Order.js";
import Cart from "../models/cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

//Get User Orders
// /api/orders

export const getOrders =async(req:Request,res:Response)=>{
    try {
        const order =await Order.find({user:req.user._id}).populate("items.product","name images").
                           sort({createdAt:-1})
        
        return res.status(200).json({
            success:true,
            message:"Orders fetched successfully..",
            data:order
        })

    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get single order
// /api/orders/:id

export const getSingleOrder =async(req:Request,res:Response)=>{
    try {
        const {id} =req.params;//here we get that order
        const order =await Order.findById(id).populate("items.product","name images");//here the user get the single order detail

        if(!order){
            return res.status(404).json({
                success:false,
                message:"Order not found.."
            })
        }

        if(order.user.toString()!==req.user._id.toString()  || req.user.role !=="admin"){
            return res.status(403).json({
                success:false,
                message:"Not authorized.."
            })
        }

        return res.status(200).json({
            success:true,
            message:"Order fetched successfully",
            data:order
        })

    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// Create Order from cart
// POST /api/orders

export const createOrder =async(req:Request,res:Response)=>{
    try {
        const {shippingAddress ,notes} =req.body;// here its get the shipping Addres +notes of order

        const cart =await Cart.findOne({user:req.user._id}).populate("items.product");

        if(!cart || cart.items.length ===0){
            return res.status(400).json({
                success:false,
                message:"Cart is empty.."
            })
        }
        // verify stock and prepare ordre items

        const orderItems =[];
        for(const item of cart.items){
            const product =await Product.findById(item.product._id);

            // if the stock is not present as our required quantity of our cart
            if(!product || product.stock < item.quantity){
                return res.status(400).json({
                    success:false,
                    message:`Insufficient stock for ${(item.product as any).name} `
                })
            }
            
            //if stock >=quantity then we place the order 
            orderItems.push({
                product:item.product._id,
                name:(item.product as any).name,
                quantity:item.quantity,
                price:item.price,
                size:item.size
            })
          
            // here we reduce the stock in that product database so that its update real- time as well
            product.stock -=item.quantity;
            await product.save();
        }

        const subtotal = cart.totalAmount;
        const shippingCost =2;
        const tax =0;
        const totalAmount =subtotal + shippingCost + tax;

        const order =await Order.create({
            user:req.user._id,
            items:orderItems,
            shippingAddress,
            paymentMethod:req.body.paymentMethod || 'cash',
            paymentStatus:"pending",
            subtotal,
            shippingCost,
            tax,
            totalAmount,
            notes,
            paymentIntentId:req.body.paymentIntentId,
            orderNumber:'ORD-'+Date.now(),
        })

        if(req.body.paymentMethod !=="stripe"){
            cart.items =[];
            cart.totalAmount =0;
            await cart.save();
        }

        return res.status(201).json({
            success:true,
            message:"Order created successfully",
            data:order
        })

    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// Update order status

// PUT /api/orders/:id/status

export const updateOrderStatus =async(req:Request,res:Response)=>{
    try {
        const {orderStatus ,paymentStatus} =req.body;// here we get these data from the frontEnd body and here we have to update the backend 
        const order =await Order.findById(req.params.id);

        if(!order){
            return res.status(404).json({
                success:false,
                message:"Order not found."
            })
        }
        if(orderStatus) order.orderStatus =orderStatus;

        if(paymentStatus) order.paymentStatus =paymentStatus;//agar pyment status nhi aaya ot 

        if(orderStatus === 'delivered') order.deliveredAt = new Date();

        await order.save();// here we save that current order in db

        return res.status(201).json({
            success:true,
            message:"Order status updted successfully",
            data:order
        })

    } catch (error:any) {
      return res.status(500).json({
         success:false,
         message:error.message
      })   
    }
}

// get all order
// GET /api/orders/admin/all

export const getAllOrders =async(req:Request,res:Response)=>{
    try {
        const {page=1,limit=20,status} =req.query;//here we get query
        const query :any ={}
        if(status) query.orderStatus =status;

        const total =await Order.countDocuments(query);//here we get that tltal order

        const orders =await Order.find(query).populate("user","name email").populate("items.product","name").sort({createdAt:-1}).
                            skip((Number(page)-1)*Number(limit)); //here we get order 


        return res.status(200).json({
            success:true,
            data:orders,
            pagination :{total,page:Number(page),pages:Math.ceil(total/Number(limit))}
        })
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// Create Stripe Payment Intent
// POST /api/orders/create-payment-intent

export const createPaymentIntent = async (req:Request, res:Response) => {//its return the id
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const subtotal = cart.totalAmount;
        const shippingCost = 2; // Match your createOrder logic
        const tax = 0;
        const totalAmount = subtotal + shippingCost + tax; 

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100), // Stripe expects amount in smallest currency unit
            currency: 'inr', 
            automatic_payment_methods: { enabled: true },
        });

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,//here its send that client secret from the stripe Intent
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
}