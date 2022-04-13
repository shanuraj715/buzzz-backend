const express = require('express');
const UserModel = require('../Model/User')
const router = express.Router()


router.get('/:string', async (req, res) => {
    const string = req.params.string
    if (string && string.length <= 2) {
        res.json({ status: false, message: "Invalid search text" })
        return
    }
    let regex = new RegExp(string, 'i')
    const results = await UserModel.find({
        $or: [
            { firstName: regex },
            { lastName: regex },
            { email: regex },
            { username: regex }
        ]
    })
    let userList = []
    results.forEach(item => {
        const obj = {
            userId: item._id,
            email: item.email,
            username: item.username,
            fname: item.firstName,
            lname: item.lastName,
            image: getUserProfileImage(item.image),
        }
        userList.push(obj)
    })
    res.json({ status: true, message: "Data fetched", data: userList })
    return
})



module.exports = router