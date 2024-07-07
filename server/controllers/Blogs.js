import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";

export const createBlog = async (req, res) => {
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
  if (!draft) {
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
  }

  const processedTags = tags.map((tag) => tag.toLowerCase());
  const blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "_")
      .trim() + nanoid();

  const blog = new Blog({
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
      const incrementVal = draft ? 0 : 1;

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
};
