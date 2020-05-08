const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

//ROUTE - GET /api/profile/me
//DESC - Get current user profile
//ACCESS - Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["firstName", "lastName"]);

    if (!profile) {
      return res.status(400).json({ msg: "You do not have a profile." });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error.");
  }
});

module.exports = router;
