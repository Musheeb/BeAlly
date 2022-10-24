const mongoose = require('mongoose');

const Report_Event = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    event_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event'
    },
    reason:{
        type:String,
        maxLength: 400,
    }

},
    {timestamps:true}
);

module.exports = mongoose.model('report_event',Report_Event);