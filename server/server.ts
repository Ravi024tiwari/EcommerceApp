import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import "dotenv/config";

import express, { Request, Response } from 'express';
import cors from "cors";
import dbConnect from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhook } from './controllers/webhooks.js';
import makeAdmin from './scripts/makeAdmin.js';
import productRouter from './routes/productRoutes.js';
import CartRouter from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoute.js';
import addressRouter from './routes/addressRoute.js';
import adminRouter from './routes/adminRoute.js';
import { seedProducts } from './scripts/seedProducts.js';


const app = express();

await dbConnect();

// Middleware
app.use(cors())
app.use(express.json());
app.use(clerkMiddleware())

app.post("/api/clerk",express.raw({type:"application-json"}),clerkWebhook) // here we create the ClerkWebhook EndPoint where 
//its mange the other users

const port = process.env.PORT || 3000;// here we have use the 3000

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live ..to check the vercel!');
});

app.use("/api/product",productRouter);//here we add the product router for each..
app.use("/api/cart",CartRouter)
app.use("/api/orders",orderRouter)
app.use("/api/address",addressRouter)
app.use("/api/admin",adminRouter)

await makeAdmin();


//Seed dummy Products if no products are present
// Here its directly insert data in our database
//await seedProducts(process.env.MONGODB_URL as string)

app.listen(Number(port),"0.0.0.0",() => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default app;