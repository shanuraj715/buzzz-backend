const express = require('express')
const res = require('express/lib/response')
const router = express.Router()
const FeedModel = require('../Model/Feed')
const auth = require('../Controller/Auth')
const UserModel = require('../Model/User')



router.post('/', async (req, res, next) => {
   // fetch uid from token
   const token = req.headers.authtoken
   const obj = auth.verify(token)
   const { postText } = req.body
   try {
      const createPost = new FeedModel({
         postText: postText,
         userId: obj.uid,
      })
      const result = await createPost.save();
      if (result) {
         res.json({status: true, message: "posted"})
         return
      }
      res.json({status: false, message: "Server Error"})
   } catch (err) {
      next(err)
   }

})



router.get('/', async (req, res, next) => {

   // FETCH FRIENDS UID FROM USERS COLLECTION and store in a variable
   const token = req.headers.authtoken
   const obj = auth.verify(token)
   if (!obj.verified) {
      res.json({ status: false, message: "session expired.post again" })
      return
   }
   const userId = obj.uid
   const data = await UserModel.findById(userId)


   if (!data) {
      res.json("error")
      return
   }

   let friendsUID = data.friends
   // FETCH DATA FROM DATABASE and 

   console.log([...friendsUID, userId])
   const myFeeds = await FeedModel.find({
      'userId': {
         $in: [...friendsUID, userId]
      },
      status: 'active'
   }, '-status').sort({createdAt: -1})

   if (!myFeeds) {
      res.json({ status: false, message: "Error while fetching feeds." })
      return
   }
   let myArr = []

   myFeeds.forEach(item => {
      let customObj = {
         postAuthor: "",
         authorThumb: "",
         postDate: item.createdAt,
         postText: item.postText,
         postImage: "",
         likes: item.likes.length,
         dislikes: item.dislikes?.length ?? 0,
         comments: item.comments.length,
         commentList: item.comments

      }
      myArr.push(customObj)
   })
   res.json({ status: true, message: "Feeds data", data: myArr })
   return
})

module.exports = router