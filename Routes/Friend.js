const express = require('express')

const router = express.Router()
const auth = require('../Controller/Auth')
const authenticate = require('../middleware/authenticate')
const UserModel = require('../Model/User')
const config = require('config')

// APIS
/*
/list/friends
/list/requests
/send
/remove
/accept
*/

router.get("/list/:type", authenticate, async (req, res) => {
    const token = req.headers.authtoken
    const userId = auth.verify(token).uid
    const friends = await UserModel.findById(userId)
    let list = []
    if (req.params.type === "friends")
        list = friends.friends
    if (req.params.type === "requests")
        list = friends.requests

    const listAsUserData = await UserModel.find({ "_id": { $in: list } }, '_id firstName lastName email username image')
    let modifiedUserList = []
    listAsUserData.forEach(item => {
        const obj = {
            userId: item._id,
            email: item.email,
            username: item.username,
            fname: item.firstName,
            lname: item.lastName,
            image: item.image ? config.get("APP_DOMAIN") + "public/images/profile-pic/" + item.image : config.get("APP_DOMAIN") + "public/images/images.png",
        }
        modifiedUserList.push(obj)
    })
    res.json({ status: true, message: "List", data: modifiedUserList })
    return
})

router.post("/send", authenticate, async (req, res) => {
    const token = req.headers.authtoken
    const userId = auth.verify(token).uid
    const secondUserId = req.body.uid
    if (!secondUserId) {
        res.json({ status: false, message: "Invalid friend id" })
        return
    }
    const friendList = await UserModel.findById(userId)
    if (friendList.friends.includes(secondUserId)) {
        res.json({ status: false, message: "You are already friends" })
        return
    }

    const friendRequest = await UserModel.findByIdAndUpdate(userId, {
        $addToSet: {
            requests: secondUserId
        }
    }, { new: true })
    if (friendRequest) {
        res.json({ status: true, message: "Friend request sent successfully" })
        return
    }
    res.json({ status: false, message: "Server error" })
    return
})

router.post('/remove', authenticate, async (req, res) => {
    const token = req.headers.authtoken
    const userId = auth.verify(token).uid
    const secondUserId = req.body.uid
    if (!secondUserId) {
        res.json({ status: false, message: "Invalid person id" })
        return
    }

    await UserModel.findByIdAndUpdate(userId, {
        $pullAll: {
            friends: [secondUserId],
            requests: [secondUserId]
        }
    })

    await UserModel.findByIdAndUpdate(secondUserId, {
        $pullAll: {
            friends: [userId],
            requests: [userId]
        }
    })
    res.json({ status: true, message: "Successfully removed" })
    return
})

router.post('/accept', authenticate, async (req, res) => {
    const token = req.headers.authtoken
    const userId = auth.verify(token).uid
    const secondUserId = req.body.uid
    if (!secondUserId) {
        res.json({ status: false, message: "Invalid person id" })
        return
    }
    await UserModel.findByIdAndUpdate(userId, {
        $pullAll: {
            requests: [secondUserId]
        },
        $addToSet: {
            friends: secondUserId
        }
    }, { new: true })
    await UserModel.findByIdAndUpdate(secondUserId, {
        $pullAll: {
            requests: [userId]
        },
        $addToSet: {
            friends: userId
        }
    }, { new: true })
    res.json({ status: true, message: "Friend request accepted" })
    return
})



module.exports = router