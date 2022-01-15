const mongoose = require('mongoose')
const Exercise = require('./exercise.model')

const user = new mongoose.Schema(
    {
        "username": { type: String, required: true },
        "exercises": []
    }
)

const User = module.exports = mongoose.model('User', user);