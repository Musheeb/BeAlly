const mongoose = require('mongoose');

const ActivePlan = new mongoose.Schema({
    success_obj_id:{
        type:String,
    },
    user_email : {
        type : String,
    },
    customer_id : {
        type : String,
    },
    plan_amount : {
        type : String,
    },
    payment_card_brand : {
        type : String,
    },
    receipt_url : {
        type : String,
    },
    payment_status : {
        type : String,
    },

    subscription_obj_id : {
        type : String,
    },
    subscription_created_date : {
        type : Date,
    },
    subscription_start_date : {
        type : Date,
    },
    subscription_end_date : {
        type : Date,
    },
    plan_id :{
        type : String,
    },
    product_id : {
        type : String,
    },
    subscription_interval : {
        type : String,
    },
    subscription_id : {
        type : String,
    },
    subscription_status: {
        type : String,
    },
    user_name: {
        type : String,
    },
    plan_name : {
        type : String,
    },
    transaction_date : {
        type : Date,
    }

},{
    timestamps : true
});

module.exports = mongoose.model('active_plan',ActivePlan);