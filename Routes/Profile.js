const express = require('express')
const mongoose = require('mongoose')
const auth = require('../Controller/Auth')

const UserModel = require('../Model/User')

const router = express.Router()


// VIEW PROFILE

const authenticate = (req, res, next) => {
    const token = req.headers.authtoken
    if (!token) {
        res.json({ status: false, message: "Invalid Token. Log in again" })
        return
    }
    const verify = auth.verify(token)
    if (!verify.verified) {
        res.json({ status: false, message: "Session expired. Log in again" })
        return
    }
    next()
}






router.get('/:uid', authenticate, async function (req, res) {
    // const { authtoken } = req.headers
    const userId = req.params.uid

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.json({ status: false, message: "Invalid request" })
        log("Invalid userId. {Profile.js Router}")
        return
    }
    // const tokenData = auth.verify(authtoken)
    const result = await UserModel.findOne({ _id: userId })
    if (result) {
        const { firstName, lastName, designation, website, gender, birthday, city, state, zip, profileImage, profileCover } = result
        res.json({
            status: true,
            message: "Data successfully sent",
            data: {
                username: result.username,
                firstname: firstName ?? "",
                lastname: lastName ?? "",
                designation: designation ?? "",
                website: website ?? "",
                gender: gender ?? "",
                birthday: birthday ?? "",
                city: city ?? "",
                state: state ?? "",
                zip: zip ?? "",
                profileImage: profileImage ?? "",
                profileCover: profileCover ?? ""
            }
        })
        return
    }
    else {
        res.json({ status: false, message: "Invalid request" })
        log("babu error aa gya")
    }
})

const validateDataForProfileUpdate = (req, res, next) => {
    const { fname } = req.body
    if (fname === undefined || (fname.length < 2 || fname.length > 32)) {
        res.json({
            status: false, message: "Invalid first name."
        })
        return
    }
    next()
}

const verifyDate = (date) => {
    if (isNaN(Date.parse(date))) {
        return false
    }
    else {
        return true
    }
}


router.post('/update', authenticate, validateDataForProfileUpdate, async (req, res, next) => {
    const { fname, lname, designation, website, gender, birthday, city, state, zip } = req.body
    const token = req.headers.authtoken
    const userId = auth.verify(token).uid


    if (!verifyDate(birthday)) {
        res.json({ status: false, message: "Invalid birth date. Use YYYY-MM-DD format" })
        return
    }

    UserModel.findByIdAndUpdate(userId, {
        firstName: fname,
        lastName: lname,
        designation: designation,
        website: website,
        gender: gender,
        birthday: birthday,
        city: city,
        state: state,
        zip: zip
    },
        { new: true },
        (err, data) => {
            if (err) {
                next(err)
            }
            else {
                log(data)
                res.json({
                    status: true,
                    message: "Successfully updated",
                    data: {
                        username: data.username,
                        firstname: data.firstName ?? "",
                        lastname: data.lastName ?? "",
                        designation: data.designation ?? "",
                        website: data.website ?? "",
                        gender: data.gender ?? "",
                        birthday: data.birthday ?? "",
                        city: data.city ?? "",
                        state: data.state ?? "",
                        zip: data.zip ?? ""
                    }
                })
            }
        })
})


module.exports = router