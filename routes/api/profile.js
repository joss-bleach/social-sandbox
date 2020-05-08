const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const request = require("request");
const config = require("config");

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

//ROUTE - GET /api/profile
//DESC - Get all profiles
//ACCESS - Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", [
      "firstName",
      "lastName",
    ]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error.");
  }
});

//ROUTE - GET /api/profile/user/:user_id
//DESC - Get all profile by user id.
//ACCESS - Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["firstName", "lastName"]);

    if (!profile) return res.status(400).json({ msg: "Profile not found." });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found." });
    }
    res.status(500).send("Server Error.");
  }
});

//ROUTE - DELETE /api/profile/
//DESC - Delete profile, user and posts
//ACCESS - Private
router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User Removed." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error.");
  }
});

//ROUTE - PUT /api/profile/experience/
//DESC - Add experience fields to profile
//ACCESS - Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Please enter a title.").not().isEmpty(),
      check("company", "Please enter a company name.").not().isEmpty(),
      check("from", "Please enter the date you started.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const new_exp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(new_exp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error.");
    }
  }
);

//ROUTE - DELETE /api/profile/experience/:exp_id
//DESC - Remove experience fields from profile
//ACCESS - Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const remove_index = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(remove_index, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error.");
  }
});

//ROUTE - PUT /api/profile/education/
//DESC - Add education fields to profile
//ACCESS - Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "Please enter a school.").not().isEmpty(),
      check("degree", "Please enter a degree.").not().isEmpty(),
      check("field_of_study", "Please enter a field of study.").not().isEmpty(),
      check("from", "Please enter the date you started.").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      field_of_study,
      from,
      to,
      current,
      description,
    } = req.body;

    const new_edu = {
      school,
      degree,
      field_of_study,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(new_edu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error.");
    }
  }
);

//ROUTE - DELETE /api/profile/education/:edu_id
//DESC - Remove education fields from profile
//ACCESS - Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const remove_index = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(remove_index, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error.");
  }
});

//ROUTE - GET /api/profile/github/:username
//DESC - Get user repos from GitHub
//ACCESS - Public
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created: asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubClientSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error();
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No GitHub profile found." });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error.");
  }
});

module.exports = router;
