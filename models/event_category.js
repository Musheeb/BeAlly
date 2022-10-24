const mongoose = require('mongoose')

let current = new Date();
let timeStamp = new Date(Date.UTC(current.getFullYear(),
    current.getMonth(), current.getDate()))

const EventScehema = new mongoose.Schema({
    created_At:{
      type:Date,
      default:timeStamp
    },
   name:{
        type:String,
        required:true,
        trim:true
    },
    
    is_subscription:{
        type:Boolean,
        default:false
    },
    picture:{
        type:String,
        required:true
    },
    updated_At:{
        type:Date,
        default:timeStamp
      }
});

module.exports = mongoose.model('Event_Category',EventScehema);