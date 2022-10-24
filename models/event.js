const mongoose = require('mongoose');

const Event = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxLength: 40,
    },
    picture: {
        type: String,
    },
    start_date_and_time: {
        type: Date,
    },
    end_date_and_time: {
        type: Date,
    },
    age_limit: {
        type: Number,
    },
    gender_specification: {
        type: String,
        default: 'combine',
        enum: ['male', 'female', 'combine'],
        
    },
    venue: {
        type: String,
    },
    description: {
        type: String,
        trim: true,
        maxLength: 300,
        default:null,
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
    },
    category_picture:{
        type:String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
    }

});

Event.pre('save', function (next) {
    const date = new Date();
    this.updated_at = date;
    if (!this.created_at) {
        this.created_at = date;
    }
    next();
});

module.exports = mongoose.model('event', Event);