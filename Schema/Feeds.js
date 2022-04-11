const mongoose = require('mongoose')


const schema = new mongoose.Schema({
    postText: {
        type: String,
        minLength: 0,
        maxLength: 4096,

    },
    userId: {
        type: String,
        isRequired: true,

    },
    status: {
        type: String,
        default: "active",
        enum: ['active', 'deleted', 'blocked']
    },
    media: {
        type: String
    },
    likes: {
        type: Array
    },
    dislikes: {
        type: Array
    },
    comments: {
        type: Array
    }
}, {
    timestamps: true
})

module.exports = schema