const mongoose = require('mongoose');

const user = new mongoose.Schema(
    {
        "username": { type: String, required: true },
        "exercises": [{
            description: String,
            duration: Number,
            date: Date
        }]
    }
)

const User = module.exports = mongoose.model('User', user);