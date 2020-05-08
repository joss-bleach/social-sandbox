const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const DbConnect = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🗂 Database Connected.");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = DbConnect;
