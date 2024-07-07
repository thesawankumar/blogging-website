import express from "express";
import {  googleAuth, login, register } from "../controllers/Auth.js";

const router = express.Router();

router.post("/signup", register);
router.post("/signin", login);
router.post("/google-auth", googleAuth);
// router.get("/get-upload-url", getAppUrl);

export default router;
