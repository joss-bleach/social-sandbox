const express = require("express");
const DbConnect = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;
DbConnect();

app.get("/", (req, res) => res.send("API Working."));

app.listen(PORT, () => console.log(`🚀Listening on port ${PORT}.`));
