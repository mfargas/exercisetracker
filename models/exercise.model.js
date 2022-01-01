const mongoose = require('mongoose');

const exercise = new mongoose.Schema(
    {
        username: { type: String, required: true },
        description: { type: String, required: true },
        duration: { type: Number, required: true },
        date: { type: Date, required: true }
    },
    {
        timestamps: true
    },
    {   
        typeKey: '$type' 
    }
);

const Exercise = module.exports = mongoose.model('Exercise', exercise);