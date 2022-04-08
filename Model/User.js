const mongoose = require('mongoose')
const UserSchema = require('../Schema/Users')

const User = mongoose.model('User', UserSchema)

module.exports = User