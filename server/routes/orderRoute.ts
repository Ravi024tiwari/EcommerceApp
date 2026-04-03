import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.js";
import { createOrder, getAllOrders, getOrders, getSingleOrder, updateOrderStatus } from "../controllers/orderController.js";

const orderRouter =Router();

// Get user orders
orderRouter.get("/",protect,getOrders)

// Get single order
orderRouter.get("/:id",protect,getSingleOrder)

// Create Order from cart
orderRouter.post("/",protect,createOrder)

// Update order status for admin only
orderRouter.put("/:id/status",protect,authorize("admin"),updateOrderStatus);//here its update the status or the selected order

// get All orders for admin
orderRouter.get("/admin/all",protect,authorize("admin"),getAllOrders)


export default orderRouter