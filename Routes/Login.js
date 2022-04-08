const express = require('express')
const router = express.Router()
const userModel = require('../Model/User')
const auth = require('../Controller/Auth')

router.post('/', async (req, res, next) => {
    const { username, password } = req.body
    const result = await userModel.findOne({ username, password })
    if (!result) {
        res
            .json({ message: 'Invalid Username or Password' })
        return
    }
    const { email } = result

    // SIGN TOKEN
    const token = auth.sign({
        username: username,
        email: email
    })

    res
        .set({ "x-auth-token": token, "Access-Control-Expose-Headers": "x-auth-token" })
        .json({
            status: true,
            message: "Successfully logged in.",
            data: {
                email: email,
                username: username
            }
        })
    return
})

module.exports = router