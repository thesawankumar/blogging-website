import express from "express";
import { verifyJWT } from "../utils/jwt.js";
import {
  createBlog,
  latestBlogs,
  trendingBlogs,
  searchBlogs,
  latestBlogsCount,
  searchBlogsCount,
  getBlogs
} from "../controllers/Blogs.js";
const router = express.Router();

router.post("/create-blog", verifyJWT, createBlog);
router.post("/latest-blogs", latestBlogs);
router.get("/trending-blogs", trendingBlogs);
router.post("/search-blogs", searchBlogs);
router.post("/all-latest-blogs-count", latestBlogsCount);
router.post("/search-blogs-count", searchBlogsCount);
router.post("/get-blog", getBlogs);

export default router;
