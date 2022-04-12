const express = require('express')
const mongoose = require('mongoose')
const auth = require('../Controller/Auth')
const path = require('path');
const fs = require('fs')
const authenticate = require('../middleware/authenticate')

const UserModel = require('../Model/User');
const config = require('config')

const router = express.Router()


// VIEW PROFILE

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





router.get('/:uid', authenticate, async function (req, res) {
    // const { authtoken } = req.headers
    const userId = req.params.uid
    const token = req.headers.authtoken
    const tokenObj = auth.verify(token)
    let isFriend = false;
    if (tokenObj.uid === userId) {
        isFriend = true;
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.json({ status: false, message: "Invalid request" })
        log("Invalid userId. {Profile.js Router}")
        return
    }
    // const tokenData = auth.verify(authtoken)
    const result = await UserModel.findOne({ _id: userId })
    console.log(userId, tokenObj.uid)
    if (!isFriend) {
        console.log(result.friends)
        if (result.friends.includes(tokenObj.uid)) {
            isFriend = true
        }
    }
    if (result) {
        const { firstName, lastName, designation, website, gender, birthday, city, state, zip, image, cover } = result
        res.json({
            status: true,
            message: "Data successfully sent",
            data: {
                userId: result._id,
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
                profileImage: image ? config.get("APP_DOMAIN") + "public/images/profile-pic/" + image : config.get("APP_DOMAIN") + "public/images/images.png",
                profileCover: cover ?? "",
                isFriend: isFriend
            }
        })
        return
    }
    else {
        res.json({ status: false, message: "Invalid request" })
        log("error aa gya")
    }
})




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

const saveFilenameToDatabase = async (req, filename) => {
    const token = auth.verify(req.headers.authtoken)
    const userId = token.uid
    const result = await UserModel.findByIdAndUpdate(userId, {
        $set: {
            image: filename
        }
    })
    log(userId)
    return
}

router.post('/image/main', authenticate, function (req, res, next) {
    const extension = req.files.file.name.split('.').at(-1)
    // SUPPORTED EXTENSIONS
    const supported = ['jpg', 'jpeg', 'png']
    if (!supported.includes(extension)) {
        res.json({ status: false, message: "Invalid image type." })
        return
    }
    const file = req.files.file
    console.log(extension)
    let date = new Date()
    const filename = `${date.getFullYear() * 3}${date.getMonth() * 5}${date.getDate() * 12}${date.getHours() * 2}${date.getMinutes() * 5}${date.getSeconds() * 3}${date.getMilliseconds() * Math.floor(Math.random() * (9 - 0 + 1) + 0)}${date.getMilliseconds() * Math.floor(Math.random() * (15 - 2 + 1) + 2)}.${extension}`

    if (fs.existsSync(path.join(__dirname, '../public/images/profile-pic'))) {
        file.mv(path.join(__dirname, '../public/images/profile-pic/' + filename), (err) => {
            if (err) {
                log(err)
                res.json({ status: false, message: "Unable to save file to the server." })
                return
            }
            saveFilenameToDatabase(req, filename)
            res.json({
                status: true, message: "File saved successfully.",
                profileImage: config.get("APP_DOMAIN") + "public/images/profile-pic/" + filename,
            })
            return
        })
        return
    }
    fs.mkdir(path.join(__dirname, '../public/images/profile-pic'), (err) => {
        if (err) {
            log(err)
        }
        file.mv(path.join(__dirname, '../public/images/profile-pic/' + filename), (err) => {
            if (err) {
                log(err)
                res.json({ status: false, message: "Unable to save file to the server." })
                return
            }
            saveFilenameToDatabase(req, filename)
            res.json({
                status: true, message: "File saved successfully.",
                profileImage: config.get("APP_DOMAIN") + "public/images/profile-pic/" + filename,
            })
            return
        })
        return
    })



})


module.exports = router