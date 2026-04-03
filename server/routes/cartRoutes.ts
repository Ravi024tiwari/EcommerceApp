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
//hmne remove its from the Cart the functionality nhi likhi hai abhi tak

//clear Cart
//here its clear that cart 
CartRouter.delete("/clear",protect,clearCart)


export default CartRouter;