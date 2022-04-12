const express = require('express')
const res = require('express/lib/response')
const router = express.Router()
const FeedModel = require('../Model/Feed')
const auth = require('../Controller/Auth')


router.get('/ll', (req, res, next) => {
   const token = req.headers.authtoken
   const obj = auth.verify(token)
   res.json(obj)
})

router.post('/', async (req, res, next) => {
   const { postText } = req.body
   try {
      const createPost = new FeedModel({
         postText: postText,
         userId: "101",
      })
      const result = await createPost.save();
      if (result) {
         res.json("Kaam ho gya bhai")
         return
      }
      res.json("Kaam nhi kr paaya main")
   } catch (err) {
      next(err)
   }

})

router.get('/feeds', async (req, res, next) => {

   // FETCH FRIENDS UID FROM USERS COLLECTION and store in a variable

   const friendsUID = []
   // FETCH DATA FROM DATABASE and 
   FeedModel.find({
      '_id': {
         $in: {
            friendsUID
         },
         $and: {
            status: 'active'
         }
      }
   }, (err, data) => {
      if (err) {
         res.json({ status: false, message: "Write your error message here" })
         return
      }
      res.json({ status: true, message: "Feeds data", data: data })
      return
   })
})

module.exports = router