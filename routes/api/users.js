const express = require("express");
const router = express.Router();

//ROUTE - GET /api/users
//DESC - Test Route
//ACCESS - Public
router.get("/", (req, res) => res.send("User Route"));

module.exports = router;
