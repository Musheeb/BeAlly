const mongoose = require('mongoose');

const AllMessages = new mongoose.Schema({
    conversation_id:{
        type:String,
    },
    sender_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'OVOMessages',
    },
    receiver_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'OVOMessages',
    },
    message:{
        type:String,
    },
    message_type:{
        type:Number,
    },
    photo_url:{
        type:String
    },
    seen:{
        type:Number,
        default:0,
    }

},
    {
        timestamps:true
    }
);

module.exports = mongoose.model('allmessages',AllMessages);