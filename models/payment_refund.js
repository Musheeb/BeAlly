const mongoose = require('mongoose');

const PaymentRefund = new mongoose.Schema({
    customer_id : {
        type : String,
    },
    payment_amount : {
        type : String,
    },
    refund_reason : {
        type : String,
    },
    
    plan_id : {
        type : String,
    }
})