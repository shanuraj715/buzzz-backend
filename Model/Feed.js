const mongoose = require('mongoose')
const FeedSchema = require('../Schema/Feeds')

const Feed = mongoose.model('Feed',FeedSchema)


module.exports = Feed