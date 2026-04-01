import { Request ,Response} from "express";
import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

export const getProducts =async(req:Request,res:Response)=>{
    try {
        const {page=1,limit=10} =req.query;//here we get the query from the 
        const query:any ={isActive:true}

        const total =await Product.countDocuments(query);//here its counts the number of documents its have

        const products =await Product.find(query).skip((Number(page)-1)*Number(limit)).limit(Number(limit));//here we get the product list
        // with the using of pagination of the products 

        return res.status(200).json({
            success:true,
            message:"Products fetched successfully..",
            data:products,
            pagination:{total,page:Number(page),pages:Math.ceil(total/Number(limit))},
        })
        
    } catch (error:any) {
       return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// get single Product

export const getProduct =async(req:Request,res:Response)=>{
    try {
        const productId =req.params.id;
        const product =await Product.findById(productId);

        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found."
            })
        }

        return res.status(200).json({
            success:true,
            message:"Product found successfully..",
            data:product
        })


    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// create Product

//POST /api/products

export const createProduct =async(req:Request,res:Response)=>{
    try {
        let images:string[] = [];
        
        // Handles files uploads..
        if(req.files && (req.files as any).length>0){
            const uploadPromise =(req.files as any).map((file:any)=>{ //here uploading all the images
                return new Promise((resolve,reject)=>{
                    const uploadStream =cloudinary.uploader.upload_stream({folder:"ecom-app/products"},(error,result)=>{
                        if(error)reject(error)
                            else resolve(result!.secure_url)
                    })
                    uploadStream.end(file.buffer)
                })
        })

        images =await Promise.all(uploadPromise)

        }
        // for the sizes of the products 

        let sizes = req.body.sizes || [];
        
        if(typeof sizes ==="string"){
            try {
                sizes =JSON.parse(sizes)
            } catch (e) {
                sizes= sizes.split(",").map((s:string)=>s.trim()).filter((s:string)=> s!="");
            }
        }
       
        // Ensure they are arrays..
        if(!Array.isArray(sizes)) sizes =[sizes];

        const productData ={
            ...req.body,
            images:images,// here adding new images on the product
            sizes
        }

        if(images.length===0){
            return res.status(400).json({
                success:false,
                message:"Please upload at least one image"
            })
        }

        const product =await Product.create(productData);// here we will create the product

        return res.status(201).json({
            success:true,
            message:"New Product created successfully..",
            data:product
        })

    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:"New Product creation failed.."
        })
    }
}

// update products 
//PUT /api/products/:id

export const updateProduct =async(req:Request,res:Response)=>{
    try {
        let images:string[] = [];

        if(req.body.exitingImages)
        
       
        if(req.body.exitingImages){
            if(Array.isArray(req.body.exitingImages)){
                images = [...req.body.exitingImages]
            }
            else{
                images = [req.body.exitingImages]
            }
        }

         // Handles files uploads..

        if(req.files && (req.files as any).length>0){
            const uploadPromise =(req.files as any).map((file:any)=>{
                return new Promise((resolve,reject)=>{
                    const uploadStream =cloudinary.uploader.upload_stream({folder:"ecom-app/products"},(error,result)=>{
                        if(error)reject(error)
                            else resolve(result!.secure_url)
                    })
                    uploadStream.end(file.buffer)
                })
        })
        const  newimages =await Promise.all(uploadPromise);
        images =[...images,...newimages];//here we upload new images on cloudinary
        }
        
        const updates = {...req.body};

        if(req.body.size){
            let sizes = req.body.sizes;

            if(typeof sizes ==="string"){
                try {
                    sizes =JSON.parse(sizes)
                } catch (e) {
                    sizes= sizes.split(",").map((s:string)=>s.trim()).filter((s:string)=> s!="");
                }
            }

           if(!Array.isArray(sizes)) sizes =[sizes];
           updates.sizes =sizes ;//here we update the size of the product

        }

        if(req.body.exitingImages || (req.files && (req.files as any).length >0 )){
            updates.images =images
        }

        delete updates.exitingImages;//here we delete that images

        const product =await Product.findByIdAndUpdate(req.params.id,updates,{
            new:true,
            runValidators:true
        })

        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            })
        }


        return res.status(201).json({
            success:true,
            message:"Product updated successfully..",
            data:product
        })
     

    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:"New Product creation failed.."
        })
    }
}

// delete Product
// /api/products/:id

export const deleteProduct =async(req:Request,res:Response)=>{
    try {
        const productId =req.params.id;//here we get the deleting product id

        const product =await Product.findById(productId);
        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found.."
            })
        }

        //agar vo product lie krta hai then firstly we will delete the imgs from the cloudinary 
        if(product.images.length>0){
            const deletePromises =product.images.map((imageUrl)=>{
                const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/);
                const publicId =publicIdMatch ? publicIdMatch[1] :null
                if(publicId){
                    return cloudinary.uploader.destroy(publicId)
                }
                return Promise.resolve();
            })
            await Promise.all(deletePromises);//here its delete all images
        }

        await Product.findByIdAndDelete(productId);//here its delete that product from the database

        return res.status(200).json({
            success:true,
            message:"Product deleted sucessfully"
        })
    } catch (error:any) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}