const mongoose = require('mongoose')

let current = new Date();
let timeStamp = new Date(Date.UTC(current.getFullYear(),
    current.getMonth(), current.getDate()))

const transaSchema = new mongoose.Schema({
   created_At: {
        type: Date,
        default: timeStamp
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId
    },
    sub_plan: {
        type: String,
    
    },
    stripe_customer_id: {
        type: String,
        default:'cus_MNIpMmZskhEh57'
    },
    plan_amount: {
        type: String,
    
    },
    plan_interval: {
        type: String,
    
    },
    plan_period_start:{
        type:Date
    },
    plan_period_end:{
        type:Date
    },
    transaction_date:{
        type:Date
    },
    status:{
        type:String,
        enum:['Runing','Expired']
    },
    updated_At: {
        type: Date,
        default: timeStamp
    }
},
);

module.exports = mongoose.model('sub_transaction', transaSchema,);
