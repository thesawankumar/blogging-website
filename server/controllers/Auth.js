import { nanoid } from "nanoid";
import "dotenv/config";
import jwt from "jsonwebtoken";
import User from "../Schema/User.js";
import { getAuth } from "firebase-admin/auth";
import bcrypt from "bcrypt";

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

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


export const register = async (req, res) => {
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
};

export const login = async (req, res) => {
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
};

export const googleAuth = async (req, res) => {
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
};
