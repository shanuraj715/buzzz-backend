const mongoose = require('mongoose')


const schema = new mongoose.Schema({
    postText: {
        type: String,
        minLength:0,
        maxLength:4096,
        
    },
    userId: {
        type:String,
        isRequired:true,
        
    },
    status :{
        type: String,
        default: "active",
        enum :['active', 'deleted', 'blocked']
    }
},{
    timestamps: true
})

module.exports = schema