import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.js";
import { getDashboardStats } from "../controllers/adminController.js";

const adminRouter =Router();

// get Dashboard stats
adminRouter.get("/stats",protect,authorize("admin"),getDashboardStats)


export default adminRouter