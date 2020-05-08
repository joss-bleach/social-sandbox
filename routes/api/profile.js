const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

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

//ROUTE - POST /api/profile
//DESC - Create or update user profile
//ACCESS - Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Please update your status.").not().isEmpty(),
      check("skills", "Please update your skills.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    const profile_fields = {};
    profile_fields.user = req.user.id;
    if (company) profile_fields.company = company;
    if (website) profile_fields.website = website;
    if (location) profile_fields.location = location;
    if (bio) profile_fields.bio = bio;
    if (status) profile_fields.status = status;
    if (githubusername) profile_fields.githubusername = githubusername;
    if (skills) {
      profile_fields.skills = skills.split(",").map((skill) => skill.trim());
    }

    profile_fields.social = {};
    if (youtube) profile_fields.social.youtube = youtube;
    if (twitter) profile_fields.social.twitter = twitter;
    if (facebook) profile_fields.social.facebook = facebook;
    if (linkedin) profile_fields.social.linkedin = linkedin;
    if (instagram) profile_fields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profile_fields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profile_fields);
      await profile.save();
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error.");
    }

    console.log(profile_fields.skills);
    res.send("Profile");
  }
);

module.exports = router;
