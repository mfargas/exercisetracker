const mongoose = require('mongoose');

const exercise = new mongoose.Schema(
    {
        "userID": { type: String, required: true },
        "description": { type: String, required: true },
        "duration": { type: Number, required: true },
        "date": { type: String, required: false }
    }
);

const Exercise = module.exports = mongoose.model('Exercise', exercise);