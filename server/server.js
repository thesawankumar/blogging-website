import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./admin.json" assert { type: "json" };
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";

const app = express();
const PORT = process.env.PORT || 4000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

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

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ error: "No access token" });
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user.id;
    next();
  });
};

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};
const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let usernameExists = await User.exists({
    "personal_info.username": username,
  });

  while (usernameExists) {
    username = email.split("@")[0] + nanoid(5);
    usernameExists = await User.exists({
      "personal_info.username": username,
    });
  }

  return username;
};

//upload image url

app.get("/get-upload-url", (req, res) => {
  generateUploadUrl()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

app.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Full name must be at least 3 letters long" });
  }
  if (!email.length) {
    return res.status(403).json({ error: "Enter Email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "Enter valid email" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password must be at least 6 characters and contain at least one number, one uppercase letter, and one lowercase letter.",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
      },
    });

    const savedUser = await user.save();
    return res.status(200).json(formatDatatoSend(savedUser));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(500).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: err.message });
  }
});

app.post("/signin", (req, res) => {
  let { email, password } = req.body;

  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "User not found" });
      }

      if (!user.google_auth) {
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
          if (err) {
            return res
              .status(403)
              .json({ error: "Error in comparing password" });
          }
          if (!result) {
            return res.status(403).json({ error: "Invalid password" });
          } else {
            return res.status(200).json(formatDatatoSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error:
            "Account was created using google, try logging with google please!",
        });
      }
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

app.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;
  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodeUser) => {
      let { email, name, picture } = decodeUser;
      picture = picture.replace("s96-c", "s384-c");

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google-auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });

      if (user) {
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "this email was signup  without google . please login with a different email",
          });
        }
      } else {
        let username = await generateUsername(email);
        user = new User({
          personal_info: {
            fullname: name,
            username: username,
            email,
            profile_img: picture,
            google_auth: true,
          },
        });

        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
      return res.status(200).json(formatDatatoSend(user));
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ error: "failed to authenticate with google" });
    });
});

app.post("/create-blog", verifyJWT, (req, res) => {
  const authorId = req.user;
  const {
    title = "",
    content = {},
    tags = [],
    des = "",
    banner = "",
    draft,
  } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "title is required" });
  }
  if (!des.length || des.length > 200) {
    return res.status(403).json({ error: "description is required" });
  }
  if (!banner.length) {
    return res.status(403).json({ error: "banner is required" });
  }
  if (!content.blocks || !content.blocks.length) {
    return res.status(403).json({ error: "content is required" });
  }
  if (!tags.length || tags.length > 10) {
    return res.status(403).json({ error: "tags is required" });
  }

  const processedTags = tags.map((tag) => tag.toLowerCase());
  const blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "_")
      .trim() + nanoid();

  let blog = new Blog({
    author: authorId,
    blog_id,
    title,
    content,
    tags: processedTags,
    des,
    draft: Boolean(draft),
  });

  blog
    .save()
    .then((blog) => {
      let incrementVal = draft ? 0 : 1;

      User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: { blogs: blog._id },
        }
      )
        .then((user) => {
          return res.status(200).json({ id: blog.blog_id });
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .json({ error: "internal server error updated total post error" });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
