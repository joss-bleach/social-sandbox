const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");

//ROUTE - POST /api/users
//DESC - Register User
//ACCESS - Public
router.post(
  "/",
  [
    check("firstName", "Please enter your first name.").not().isEmpty(),
    check("lastName", "Please enter your last name.").not().isEmpty(),
    check("email", "Please enter a valid email address.").isEmail(),
    check(
      "password",
      "Your password must be at least 6 characters long."
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //REGISTER USER
    try {
      const { firstName, lastName, email, password } = req.body;

      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists." }] });
      }

      user = new User({
        firstName,
        lastName,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      res.send("Registered Successfully.");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error.");
    }
  }
);

module.exports = router;
