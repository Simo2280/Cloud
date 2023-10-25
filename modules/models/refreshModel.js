const mongoose = require("mongoose");

const refreshSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: true }
});

const refreshModel = mongoose.model("refresh", refreshSchema)

module.exports = refreshModel;