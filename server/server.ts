import dns from 'node:dns/promises';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import "dotenv/config";

import express, { Request, Response } from 'express';
import cors from "cors";
import dbConnect from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import { clerkWebhook } from './controllers/webhooks.js';


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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default app;