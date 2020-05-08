const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");

//ROUTE - POST /api/posts
//DESC - Create a post
//ACCESS - Private
router.post(
  "/",
  [auth, [check("text", "Please enter some text.").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const new_post = new Post({
        text: req.body.text,
        firstName: user.firstName,
        lastName: user.lastName,
        user: req.user.id,
      });

      const post = await new_post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//ROUTE - GET /api/posts
//DESC - Get all posts
//ACCESS - Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//ROUTE - GET /api/posts/:id
//DESC - Get single post
//ACCESS - Private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "No post found." });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "No post found." });
    }
    res.status(500).send("Server Error");
  }
});

//ROUTE - DELETE /api/post/:id
//DESC - Remove a post
//ACCESS - Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No post found." });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Unauthorised." });
    }
    await post.remove();
    res.json({ msg: "Post removed successfully." });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "No post found." });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
