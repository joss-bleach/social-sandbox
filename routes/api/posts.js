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

//ROUTE - PUT /api/posts/like/:id
//DESC - Like a post
//ACCESS - Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked." });
    }
    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error.");
  }
});

//ROUTE - Put /api/posts/unlike/:id
//DESC - Remove a like
//ACCESS - Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not yet been liked." });
    }

    const remove_index = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(remove_index, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error.");
  }
});

//ROUTE - POST /api/posts/comment/:id
//DESC - Comment on a post
//ACCESS - Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Please enter some text.").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const new_comment = {
        text: req.body.text,
        firstName: user.firstName,
        lastName: user.lastName,
        user: req.user.id,
      };

      post.comments.unshift(new_comment);

      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//ROUTE - DELETE /api/posts/comment/:id/:comment_id
//DESC - Delete comment on a post
//ACCESS - Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found." });
    }

    if (comment.user.toString() != req.user.id) {
      return res.status(401).json({ msg: "Unauthorised Request. " });
    }

    const remove_index = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(remove_index, 1);

    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error.");
  }
});

module.exports = router;
