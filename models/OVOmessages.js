const mongoose = require('mongoose');

const OVOMessages = new mongoose.Schema({
    user_1_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
    },
    user_1_name:{
        type:String,
    },
    user_2_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
    },
    user_2_name:{
        type:String,
    },
    first_message:{
        type:String,
    }
    
},
    {
        timestamps:true
    }
);

module.exports = mongoose.model('OVOMessages',OVOMessages);
