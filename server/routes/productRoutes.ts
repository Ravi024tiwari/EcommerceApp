import express, { Router } from "express"
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/productController.js";
import upload from "../middlewares/upload.js";
import { authorize, protect } from "../middlewares/auth.js";

const productRouter =Router();

//get all the products
productRouter.get("/",getProducts)

//get single product
productRouter.get("/:id",getProduct)

//add new product (admin Only)

productRouter.post("/",upload.array("images",5),protect,authorize("admin"),createProduct)

//update Product (admin only)

productRouter.put("/:id",upload.array('images',5),protect,authorize("admin"),updateProduct)

//Delete Product
productRouter.delete("/:id",protect,authorize("admin"),deleteProduct)


export default productRouter;