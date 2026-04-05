import mongoose, { Schema } from "mongoose";
import { IOrder, IOrderItem } from "../types/index.js";

const orderItemSchema =new Schema<IOrderItem>({// this is the particular product of Order
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    name:{
        type:String
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    },
    price:{
        type:Number,
        required:true
    },
    size:{
        type:String
    }

})

const orderSchema =new Schema<IOrder>({
     user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
     },
     orderNumber:{
        type:String,
        unique:true
     },
     items:[orderItemSchema],//here its the object of different products 
     shippingAddress:{
        street:{ type:String , required:true},
        city:{type:String ,required:true},
        state:{type:String,required:true},
        zipCode:{type:String,required:true},
        country:{type:String,required:true}

     },
     paymentMethod:{
        type:String,
        required:true,
        enum:['cash','stripe','razorpay'],
        default:'cash'
     },
     paymentStatus:{
        type:String,
        enum:['pending','paid','failed','refunded'],
        default:'pending'
     },
     paymentIntentId:{
        type:String
     },
     orderStatus:{
        type:String,
        enum:['placed','processing','shipped','delivered','cancelled'],
        default:'placed'
     },
     totalAmount:{
      type:Number,
      default:0
     },
     subtotal:{
        type:Number,
        default:0
     },
     shippingCost:{
        type:Number,
        default:0
     },
     tax:{
        type:Number,
        default:0
     },
     notes:{
        type:String
     },
     deliveredAt:Date

},{timestamps:true})

const Order = mongoose.model<IOrder>("Order",orderSchema)

export default Order