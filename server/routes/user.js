import express from "express";
import {
  googleAuth,
  login,
  register,
  searchUsers,
} from "../controllers/Auth.js";

const router = express.Router();

router.post("/signup", register);
router.post("/signin", login);
router.post("/google-auth", googleAuth);
router.get("/search-users", searchUsers);

export default router;
