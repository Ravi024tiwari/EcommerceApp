import { Router } from "express";
import { protect } from "../middlewares/auth.js";
import { addAddress, deleteAddress, getAddresses, updateAddress } from "../controllers/addressController.js";

const addressRouter =Router()

addressRouter.get("/",protect,getAddresses)

addressRouter.post("/",protect,addAddress)

addressRouter.put("/:id",protect,updateAddress)

addressRouter.delete("/:id",protect,deleteAddress)

export default addressRouter