const express = require('express');
const auth = require('../Controller/Auth')



const router = express.Router()


router.get('/validate', (req, res) => {
    const token = req.headers.authtoken
    if (!token) {
        res.status(403).json({
            status: false, message: "Please provide session token"
        })
        return
    }
    const obj = auth.verify(token)
    if (!obj.verified) {
        res.json({ status: false, message: "Expired token" })
        return
    }
    res.json({
        status: true,
        message: "Logged In",
        logged: true,
        data: {
            token: token,
            userId: obj.uid,
            username: obj.username
        }
    })
})

module.exports = router