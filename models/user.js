const mongoose = require('mongoose');

const User = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        maxLength: 50,
        minLength: 3,
    },
    email: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
    },
    mobile_number: {
        type: String,
        trim: true,
    },
    age: {
        type: Number,
        trim: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female'],  
    },
    address: {
        type: String,
        trim: true,
    },
    dob: {
        type: Date,
        trim: true,
    },
    profile_picture: {
        type: String,
    },
    intrested_category: {
        type: Array,
    },
    is_subscribed: {
        type: Boolean,
        default:false,
    },
    strip_customer_id : {
        type : String,
    },
    monthly_subscribed : {
        type : String,
    },
    quarterly_subscribed : {
        type : String,
    },
    yearly_subscribed : {
        type : String,
    },
    is_social: {
        type: Boolean,
        default:false,
    },
    fcm_token: {
        type: String,
        trim: true,
    },
    device_type: {
        type: String,
        enum: ['android', 'ios'],
    },
    device_id: {
        type: String,
        trim: true,
    },
    is_blocked: {
        type: Boolean,
        default:false,
    },
    is_deleted: {
        type:Boolean,
        default:false,
    },
    otp:{
        type:String,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
    }
});



User.pre('save', function (next) {
    const date = new Date();
    this.updated_at = date;
    if (!this.created_at) {
        this.created_at = date;
    }
    next();
});

//Have to uncomment this below part of code to hide otp from response.

// User.pre(/^findOne/, function(next){
//     this.select("-otp");
//     next();
// });

module.exports = mongoose.model('user', User);