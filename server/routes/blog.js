import express from "express";
import { verifyJWT } from "../utils/jwt.js";
import { createBlog, latestBlogs } from "../controllers/Blogs.js";
const router = express.Router();

router.post("/create-blog", verifyJWT, createBlog);
router.get("/latest-blogs", latestBlogs);

export default router;
