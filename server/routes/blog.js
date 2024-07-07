import express from "express";
import { verifyJWT } from "../utils/jwt.js";
import { createBlog } from "../controllers/Blogs.js";
const router = express.Router();

router.post("/create-blog", verifyJWT, createBlog);

export default router;
