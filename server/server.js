import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import { nanoid } from "nanoid";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./admin.json" assert { type: "json" };

import aws from "aws-sdk";
import user from "./routes/user.js";
import blogs from "./routes/blog.js";


const app = express();
const PORT = process.env.PORT || 4000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

app.use(express.json());
app.use(cors());
connectDB();

//setting up s3 bucket

const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadUrl = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpg`;

  return await s3.getSignedUrlPromise("putObject", {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

//upload image url

app.get("/get-upload-url", (req, res) => {
  generateUploadUrl()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

//routes
app.use("/", user);
app.use("/", blogs);

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
