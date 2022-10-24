const mongoose = require('mongoose');

const ContactAdmin = new mongoose.Schema({
    username : {
        type:String,
    },
    user_email : {
        type:String,
    },
    subject:{
        type:String,
    },
    query : {
        type:String,
    }
},{
    timestamps:true
});

module.exports = mongoose.model('contact_admin',ContactAdmin);