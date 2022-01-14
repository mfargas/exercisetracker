const mongoose = require('mongoose');

const user = new mongoose.Schema(
    {
        "username": { type: String, required: true },
        "exercises": [{
            description: { type: String, required: true },
            duration: { type: Number, required: true },
            date: { type: String, required: true }
        }]
    }
)

const User = module.exports = mongoose.model('User', user);