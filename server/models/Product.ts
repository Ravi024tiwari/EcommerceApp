import mongoose from "mongoose";
import { IProduct } from "../types/index.js";//its the interface of the product

const productSchema =new mongoose.Schema<IProduct>({
     name:{
          type:String,
          required:true,
          trim:true
     },
     description:{
        type:String,
        required:true
     },
     price:{
        type:Number,
        required:true,
        min:0
     },
     //here its store the number of images of the single product
     images:[{//array of images of the single Product is shown on
        type:String,
     }],
     sizes:[{
        type:String
     }],
     category:{
        type:String,
        required:true,
        enum:['Men','Women','Kids','Shoes','Bags','Others'],
        default:'Other'
     },
     stock:{
        type:Number,
        required:true,
        default:0,
        min:0
     },

     isFeatured:{
        type:Boolean,
        default:false
     },
     isActive:{
        type:Boolean,
        default:true
     }

},{timestamps:true})

productSchema.index({name:"text",description:"text"})//its helps to search the product

const Product =mongoose.model<IProduct>("Product",productSchema)


export default Product;