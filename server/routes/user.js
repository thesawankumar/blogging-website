import express from "express";
import {
  googleAuth,
  login,
  register,
  searchUsers,
  getUserProfile,
} from "../controllers/Auth.js";

const router = express.Router();

router.post("/signup", register);
router.post("/signin", login);
router.post("/google-auth", googleAuth);
router.get("/search-users", searchUsers);
router.post("/get-profile", getUserProfile);

export default router;
