import express from "express";
import { verifyJWT } from "../utils/jwt.js";
import {
  createBlog,
  latestBlogs,
  trendingBlogs,
  searchBlogs,
} from "../controllers/Blogs.js";
const router = express.Router();

router.post("/create-blog", verifyJWT, createBlog);
router.get("/latest-blogs", latestBlogs);
router.get("/trending-blogs", trendingBlogs);
router.post("/search-blogs", searchBlogs);

export default router;
