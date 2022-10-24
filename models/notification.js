const mongoose = require('mongoose')

let current = new Date();
let timeStamp = new Date(Date.UTC(current.getFullYear(),
    current.getMonth(), current.getDate()))

const NotificationScehema = new mongoose.Schema({
    created_At:{
      type:Date,
      default:timeStamp
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    content:{
        type:String,
        required:true,
        trim:true
    },
    banner_image:{
        type:String
    },
    updated_At:{
        type:Date,
        default:timeStamp
      }
});

module.exports = mongoose.model('notification',NotificationScehema);