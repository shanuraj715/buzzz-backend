const express = require('express')
const router = express.Router()
const auth = require('../Controller/Auth')
const userModel = require('../Model/User')

router.post('/', async (req, res, next) => {
    const { username, password } = req.body
    const result = await userModel.findOne({ username, password })
    if (!result) {
        res
            .json({ message: 'Invalid Username or Password' })
        return
    }
    const { email, _id } = result

    // SIGN TOKEN
    const token = auth.sign({
        username: username,
        email: email,
        uid: _id
    })
    res
        .set({ "x-auth-token": token, "Access-Control-Expose-Headers": "x-auth-token" })
        .cookie("authToken", token)
        .cookie('uid', _id)
        .json({
            status: true,
            message: "Successfully logged in.",
            data: {
                email: email,
                username: username,
                uid: _id
            }
        })
    return
})

module.exports = router