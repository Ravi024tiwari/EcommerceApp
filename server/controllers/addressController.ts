import { Request, Response } from "express";
import Address from "../models/address.js";

// Get User address
// GET /api/address

export const getAddresses =async(req:Request,res:Response)=>{
    try {
        const addresses =await Address.find({user:req.user._id}).sort({isDefault:-1,createdAt:-1});//here we get all

        return res.status(200).json({
            success:true,
            message:"Users address fetched successfully..",
            addresses
        })
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// Add New Address
//Post /api/addresses

export const addAddress =async(req:Request,res:Response)=>{
    try {
        const {type,street,city,state,zipCode,country,isDefault} =req.body;//here we get all details of the address
        
        //Here this address becomes the Default address of the uesr
        if(isDefault){
            await Address.updateMany({user:req.user._id},{isDefault:false})
        }

        const newAddress =await Address.create({
            user:req.user._id,
            type,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault:isDefault || false
        })


        return res.status(201).json({
            success:true,
            message:"New address added successfully",
            data:newAddress
        })

    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// update Address
// PUT /api/addresses/:id

export const updateAddress =async(req:Request,res:Response)=>{
    try {
        const {type,street,city,zipCode,country,isDefault,state} =req.body;

        let addressItem =await Address.findById(req.params.id);

        if(!addressItem){
            return res.status(404).json({
                success:false,
                message:"Address not found"
            })
        }

        //Ensure users owns Address
        if(addressItem.user.toString() !==req.user._id.toString()){//agar dono same nhi hai to
             return res.status(401).json({
                success:false,
                message:"User not authorized.."
             })
        }

        if(isDefault){
            await Address.updateMany({user:req.user._id},{isDefault:false})
        }

        // its will find and update the old Address
        addressItem =await Address.findByIdAndUpdate(req.params.id,{
            type,street,city,state,zipCode,country,isDefault
        },{new:true})

        return res.status(200).json({
            success:true,
            message:"Address update successfully",
            data:addressItem
        })

    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//Delete Address
// delete /api/address/:id

export const deleteAddress =async(req:Request,res:Response)=>{
    try {
        const address =await Address.findById(req.params.id);

        if(!address){
            return res.status(404).json({
                success:false,
                message:"Address not found.."
            })
        }

        //Ensure that user own this address
        if(address.user.toString()!==req.user._id.toString()){
            return res.status(401).json({
                success:false,
                message:"User is not authorized.."
            })
        }
        //after checking that user can delete that address

        await address.deleteOne();//here its delete that current address from db

        return res.status(200).json({
            success:true,
            message:"User successfullly delete address"
        })

        
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}