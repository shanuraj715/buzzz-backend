const mongoose = require('mongoose')
const validator = require('validator')

const schema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 6,
        maxLength: 32,
        isRequired: true
    },
    lastName: {
        type: String,
        minLength: 6,
        maxLength: 32
    },
    username: {
        type: String,
        required: true,
        minLength: 6,
        mxLength: 32
    },
    email: {
        type: String,
        unique: true
    },
    birthday: {
        type: Date
    },
    website: {
        type: String
    },
    mobile: {
        type: Number,
        maxLength: 10
    },
    country: {
        type: String,
        minLength: 2,
        maxLength: 64
    },
    state: {
        type: String,
        minLength: 2,
        maxLength: 64
    },
    city: {
        type: String,
        minLength: 2,
        maxLength: 64
    },
    zip: {
        type: Number
    },
    password: {
        type: String,
        minLength: 8,
        maxLength: 1024,
        isRequired: true
    }
})

module.exports = schema