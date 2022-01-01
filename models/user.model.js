const mongoose = require('mongoose');

const user = new mongoose.Schema(
    {
        username: { type: String, required: true }
    }
    // {
    //     typeKey: '$type'
    // }
)

const User = module.exports = mongoose.model('User', user);