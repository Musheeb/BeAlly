const mongoose = require('mongoose');

const InAppNotification = new mongoose.Schema({
    event_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'events',
    },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'savedcategories',
    },
    notif_receiver_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
    },
    event_conductor_name : {
        type : String,
    },
    event_conductor_pic : {
        type : String,
    },
    matched_category : {
        type : String,
    },
    notification_title : {
        type:String,
    },
    notification_body : {
        type:String,
    },
    seen : {
        type:Number,
        default:0,
    }

},{
    timestamps:true
});

module.exports = mongoose.model('in-app-notification',InAppNotification);