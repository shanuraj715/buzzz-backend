const express = require('express');
const router = express.Router()
const validator = require('validator')

const UserModel = require('../Model/User')

const validateData = (req, res, next) => {
    let { fname, email, password, username } = req.body
    if (!validator.isLength(fname, { min: 2, max: 32 })) {
        res.status(400).json({
            status: false,
            message: "Invalid first name."
        })
        return
    }

    if (!validator.isEmail(email)) {
        res.status(400).json({
            status: false,
            message: "Invalid email address"
        })
        return
    }

    if (!validator.isLength(password, { min: 8, max: 64 })) {
        res.status(400).json({
            status: false,
            message: "Invalid password"
        })
        return
    }

    if (!validator.isLength(username, { min: 6, max: 32 })) {
        res.status(400).json({
            status: false,
            message: "Invalid username"
        })
        return
    }

    // Pass control to next middleware
    next()
}

router.post('/', validateData, async (req, res, next) => {
    const { fname, lname, email, password, username } = req.body

    const obj = {
        fname: fname,
        lname: lname,
        email: email,
        username: username,
        password: password
    }

    let user = new UserModel(obj)
    user.save(function (err, user) {
        if (err) {
            if (err.code === 11000) {
                error = "Email already exist."
                res.json({
                    status: false,
                    message: "Email already exist. Please login to your account."
                })
            }
            next(err)
        }
        else {
            res.json({
                status: true,
                data: {
                    username: username,
                    email: email,
                    fullName: `${fname} ${lname}`
                },
                message: "Successfully registered"
            })
            return
        }
    })
})



router.get('/username/check/:username', async (req, res) => {
    const username = req.params.username
    const result = await UserModel.findOne({ username: username }).count()
    res.status(200).json({
        status: true,
        availability: !(!!result)
    })
    return
})


module.exports = router