import { Request, Response } from "express";
import Cart from "../models/cart.js";
import Product from "../models/Product.js";

//Get User Cart
// GET/api/cart

export const getCart =async(req:Request,res:Response)=>{
    try {
        let cart =await Cart.findOne({user:req.user._id}).populate("items.product","name images price stock")

        if(!cart){
            cart = await Cart.create({user :req.user._id,items:[]})
        }

        return res.status(200).json({
            success:true,
            data:cart
        })


    } catch (error:any) {
        return res.status(500).json({
            success:true,
            message:error.message
        })
    }
}

//Add item to cart
// /api/cart/add

export const addToCart =async(req:Request,res:Response)=>{
    try {
        const {productId ,quantity=1,size} =req.body;

        const product =await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found.."
            })
        }

        if(product.stock < quantity){
            return res.status(400).json({
                success:false,
                message:"Insufficient Stock... "
            })
        }
        let cart =await Cart.findOne({user:req.user._id});//here we send the userId to check that is there any cart is present of not

        if(!cart){
            cart =new Cart({user:req.user._id, items:[]})
        }

        // Find items with same product and size
        const existingItem =cart.items.find((item)=>{
            return item.product.toString() ===productId && item.size ===size
        })

        if(existingItem){
            existingItem.quantity +=quantity;//here we add new quantity in our card
            existingItem.price =product.price
        }else{
            cart.items.push({
                product :productId,
                quantity,
                price:product.price,
                size
            })
        }

        cart.calculateTotal();
        await cart.save();

        await cart.populate("items.product","name images price stock")


        return res.status(201).json({
            success:true,
            message:"Product added on cart successfully..",
            data:cart
        })


    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// update Cart item quantity
// PUT /api/cart/item/:productId

export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const { quantity, size } = req.body;
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            (item) =>
                item.product.toString() === productId &&
                item.size === size
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(
                (i) =>
                    !(i.product.toString() === productId && i.size === size)
            );
        } else {
            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock"
                });
            }

            item.quantity = quantity;
        }

        cart.calculateTotal();
        await cart.save();

        await cart.populate("items.product", "name images price stock");

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: cart
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove item from the cart
// delete /api/cart/item/:productId

export const removeCartItem =async(req:Request,res:Response)=>{
    try {
        const {size} =req.query;// we get the data of size of that product from the query of that cart
        const cart =await Cart.findOne({user:req.user._id})

        if(!cart || !size){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }
        // here we filter out those products added on the cart

        cart.items =cart.items.filter((item)=>item.product.toString()!== req.params.productId || item.size !==size)

        cart.calculateTotal();
        await cart.save();

        await cart.populate("items.product","name images price stock")

        return res.status(200).json({
            success:true,
            message:"cart updated successfully..",
            data:cart
        })



    } catch (error:any) {
        return res.status(500).json({
            success:true,
            message:error.message
        })
    }
}

// clear cart
// Delete /api/cart
//here we have to delete that cart from the logged in user db

export const clearCart =async(req:Request,res:Response)=>{
    try {

        const cart =await Cart.findOne({user:req.user._id})
        // ye bhi check krlo jo cart mila hai vo logged in user ka hi hai
        if(!cart){
            return res.status(200).json({
                success:true,
                message:"Cart is already empty."
            })
        }
        //here its clear the cart after ordering it
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

      
        return res.status(200).json({
            success:true,
            message:"Cart clear successfully.."
        })

    } catch (error:any) {
        return res.status(500).json({
            success:true,
            message:error.message
        })
    }
}