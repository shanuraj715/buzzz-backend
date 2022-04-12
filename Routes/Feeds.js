const express = require('express')
const res = require('express/lib/response')
const router = express.Router()
const FeedModel = require('../Model/Feed')
const auth = require('../Controller/Auth')
const UserModel = require('../Model/User')
const path = require('path')

const fs = require('fs')


const months = {
   "1": "January",
   "2": "February",
   "3": "March",
   "4": "April",
   "5": "May",
   "6": "June",
   "7": "July",
   "8": "August",
   "9": "September",
   "10": "October",
   "11": "November",
   "12": "December",
}

router.get('/post/:id', async (req, res) => {
   const token = req.headers.authtoken
   const uid = auth.verify(token).uid

   const item = await FeedModel.findById(req.params.id)
   const user = await UserModel.findById(item.userId)
   log(user)
   if (!user) {
      res.json({ status: false, message: "error raised" })
   }
   // console.log( data )
   let obj = {
      fname: user.firstName ?? "",
      lname: user.lastName ?? "",
      username: user.username ?? "",
      userId: user._id ?? "",
      email: user.email ?? ""
   }
   // log(obj)
   let date = new Date(item.createdAt)
   let customObj = {
      authorId: item.userId,
      postAuthor: `${obj.fname} ${obj.lname}`,
      authorThumb: "",
      postId: item._id,
      postDate: date.getDate() + '-' + months[(date.getMonth() + 1)] + "-" + date.getFullYear(),
      postText: item.postText,
      postImage: "http://localhost:5000/public/images/feeds/" + item.media,
      likes: item.likes.length,
      dislikes: item.dislikes?.length ?? 0,
      comments: item.comments.length,
      commentList: item.comments

   }
   res.json({ status: true, message: "success", data: customObj })
   return
})

router.post('/', async (req, res, next) => {

   const token = req.headers.authtoken
   const obj = auth.verify(token)





   // START THE WORK
   const extension = req.files.file.name.split('.').at(-1)
   const postText = req.body.text

   const supported = ['jpg', 'jpeg', 'png']
   if (!supported.includes(extension)) {
      res.json({ status: false, message: "Invalid image type." })
      return
   }
   const file = req.files.file
   let date = new Date()
   const filename = `${date.getFullYear() * 3}${date.getMonth() * 5}${date.getDate() * 12}${date.getHours() * 2}${date.getMinutes() * 5}${date.getSeconds() * 3}${date.getMilliseconds() * Math.floor(Math.random() * (9 - 0 + 1) + 0)}${date.getMilliseconds() * Math.floor(Math.random() * (15 - 2 + 1) + 2)}.${extension}`

   if (fs.existsSync(path.join(__dirname, '../public/images/feeds'))) {
      file.mv(path.join(__dirname, '../public/images/feeds/' + filename), async (err) => {
         if (err) {
            log(err)
            res.json({ status: false, message: "Unable to save file to the server." })
            return
         }
         const createPost = new FeedModel({
            postText: postText,
            userId: obj.uid,
            media: filename
         })
         const result = await createPost.save();
         if (result) {
            res.json({ status: true, message: "posted" })
            return
         }
         res.json({ status: false, message: "Server Error" })
         return
      })
      return
   }
   fs.mkdir(path.join(__dirname, '../public/images/feeds'), (err) => {
      if (err) {
         log(err)
      }
      file.mv(path.join(__dirname, '../public/images/feeds/' + filename), async (err) => {
         if (err) {
            log(err)
            res.json({ status: false, message: "Unable to save file to the server." })
            return
         }
         const createPost = new FeedModel({
            postText: postText,
            userId: obj.uid,
            media: filename
         })
         const result = await createPost.save();
         if (result) {
            res.json({ status: true, message: "posted" })
            return
         }
         res.json({ status: false, message: "Server Error" })
         return
      })
      return
   })
   return

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

   const myFeeds = await FeedModel.find({
      'userId': {
         $in: [...friendsUID, userId]
      },
      status: 'active'
   }, '-status').sort({ createdAt: -1 })

   if (!myFeeds) {
      res.json({ status: false, message: "Error while fetching feeds." })
      return
   }
   let myArr = []

   const allUsers = []
   myFeeds.forEach(item => {
      if (!allUsers.includes(item.userId)) {
         allUsers.push(item.userId)
      }
   })

   var userData = []
   const users = await UserModel.find({ '_id': { $in: allUsers } })

   if (!users) {
      res.json({ status: false, message: "error raised" })
   }
   // console.log( data )
   users?.forEach(item => {
      let obj = {
         fname: item.firstName ?? "",
         lname: item.lastName ?? "",
         username: item.username ?? "",
         userId: item._id ?? "",
         email: item.email ?? ""
      }
      userData[item._id] = obj
   })


   log(userData)

   myFeeds.forEach(item => {
      let date = new Date(item.createdAt)
      let customObj = {
         authorId: item.userId,
         postAuthor: `${userData[item.userId].fname} ${userData[item.userId].lname}`,
         authorThumb: "",
         postId: item._id,
         postDate: date.getDate() + '-' + months[(date.getMonth() + 1)] + "-" + date.getFullYear(),
         postText: item.postText,
         postImage: "http://localhost:5000/public/images/feeds/" + item.media,
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


router.post("/response", async (req, res) => {

   const token = req.headers.authtoken
   const obj = auth.verify(token)
   if (!obj.verified) {
      res.json({ status: false, message: "session expired.post again" })
      return
   }
   const userId = obj.uid
   const postId = req.body.pid
   if (!postId) {
      res.json({ status: false, message: "Invalid post id" })
      return
   }
   const type = req.body.type
   if (!type) {
      res.json({ status: false, message: "Invalid request. Please specify type." })
   }
   if (type === 'like') {

      const post = await FeedModel.findById(postId)
      if (post.likes.includes(userId)) {
         res.json({ status: false, message: "Already liked" })
         return
      }

      await FeedModel.findByIdAndUpdate(postId, {
         $pullAll: {
            dislikes: [userId]
         }
      })

      await FeedModel.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });

      res.status(200).json({ status: true, message: "Post has been liked" })
      return
   }
   if (type === 'dislike') {
      await FeedModel.findByIdAndUpdate(postId, {
         $pullAll: {
            likes: [userId]
         }
      })
      const result = await FeedModel.findByIdAndUpdate(postId, { $addToSet: { dislikes: userId } });
      console.log(result)
      res.status(200).json({ status: true, message: "Post has been disliked" })

      return
   }

})

router.post('/delete/', async (req, res) => {
   const token = req.headers.authtoken
   const obj = auth.verify(token)
   const userId = obj.uid

   if (!obj.verified) {
      res.json({ status: false, message: "session expired.post again" })
      return
   }
   const postId = req.body.pid
   if (!postId) {
      res.json({ status: false, message: "Invalid post id" })
      return
   }

   const postData = await FeedModel.findById(postId)
   log(postData)
   if (postData.userId !== userId) {
      res.json({})
      return
   }

   const result = await FeedModel.findByIdAndUpdate(postId, {
      $set: {
         status: "deleted"
      }
   }, {new: true})

   console.log( result )
   res.status(200).json({ status: true, message: "Post has been deleted" })
   return

})

module.exports = router

