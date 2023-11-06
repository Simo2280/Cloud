const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum : ["user", "admin"], default: "user" },
    name: { type: String },
    surname: { type: String }
});

const userModel = mongoose.model("users", userSchema)

module.exports = userModel;