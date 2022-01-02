const mongoose = require('mongoose');

const log = new mongoose.Schema(
    {
        "username": String,
        "count": Number,
        "log": Array
    }
);

const Log = module.exports = mongoose.model('Log', log);