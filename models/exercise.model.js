const mongoose = require('mongoose');

const exercise = new mongoose.Schema(
    {
        userID: { type: String, required: true },
        description: String,
        duration: Number,
        date: Date,
    }
);

const Exercise = module.exports = mongoose.model('Exercise', exercise);