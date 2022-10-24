const mongoose = require('mongoose')

let current = new Date();
let timeStamp = new Date(Date.UTC(current.getFullYear(),
    current.getMonth(), current.getDate()))

const PlanSchema = new mongoose.Schema({
    created_At:{
      type:Date,
      default:timeStamp
    },
    plan_id:{
        type:String,
        required:true,
        trim:true
    },
    plan_name:{
        type:String,
        required:true,
        trim:true
    },
    product_name:{
        type:String,
        required:true,
        trim:true
    },
    product_id:{
        type:String,
        required:true,
        trim:true
    },
    interval:{
        type:String,
        required:true,
        trim:true
    },
    interval_count:{
        type:Number,
        trim:true
    },
    currency:{
        type:String,
        required:true,
        trim:true
    },
    amount:{
        type:Number,
        required:true,
        trim:true
    },
    isActive:{
        type:Boolean,
        required:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    updated_At:{
        type:Date,
        default:timeStamp
      }
});

module.exports = mongoose.model('stripe_plan',PlanSchema);