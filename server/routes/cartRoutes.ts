import express, { Router } from "express"
import { protect } from "../middlewares/auth.js";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cartController.js";

const CartRouter =Router();

//get user cart
CartRouter.get("/",protect,getCart);

// add item to cart
CartRouter.post("/add",protect,addToCart)

//update cart quantity
CartRouter.put("/item/:productId",protect,updateCartItem)

// remove item from 
CartRouter.delete('/item/:productId',protect,removeCartItem)

//clear Cart
CartRouter.delete("/",protect,clearCart)


export default CartRouter;