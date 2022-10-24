const mongoose = require('mongoose');

const FailedPayment = new mongoose.Schema({
    charge_failed_obj_id : {
        type : String,
    },
    payment_object : {
        type : String,
    },
    amount : {
        type : Number,
    },
    amount_captured : {
        type : Number,
    },
    customer_email : {
        type : String,
    },
    customer_name : {
        type : String,
    },
    captured : {
        type : Boolean,
    },
    cancellation_time : {
        type : Date,
    },
    currency : {
        type : String,
    },
    customer_id : {
        type : String,
    },
    failure_code : {
        type : String,
    },
    failure_message : {
        type : String,
    },
    invoice_id : {
        type : String,
    },
    paid : {
        type : Boolean,
    },
    payment_method_id : {
        type : String,
    },
    payment_card_brand : {
        type : String,
    },
    card_country : {
        type : String,
    },
    card_exp_month : {
        type : Number,
    },
    card_exp_year : {
        type : Number,
    },
    payment_card_last_4_digits : {
        type : String,
    },
    refunded : {
        type : Boolean,
    },
    status : {
        type : String,
    }

},{
    timestamps : true
});

module.exports = mongoose.model('payment-failed',FailedPayment);

        // console.log(event.data.object.id)//object id for failed payment
        // console.log(event.data.object.amount)
        // console.log(event.data.object.billing_details.email)//customer email id
        // console.log(event.data.object.billing_details.name)//customer name
        // console.log(event.data.object.billing_details.created)//payment failure time in miliseconds
        // console.log(event.data.object.currency)//currency type (eg. usd)
        // console.log(event.data.object.customer)//stripe customer id
        // console.log(event.data.object.failure_code)//why payment failed (eg. because of card)
        // console.log(event.data.object.failure_message)//payment failed message
        // console.log(event.data.object.invoice)//failed payment's invoice
        // console.log(event.data.object.paid)//boolean
        // console.log(event.data.object.payment_method)//payment method id
        // console.log(event.data.object.payment_method_details.brand)//card brand
        // console.log(event.data.object.payment_method_details.last4)//last four digits of card
        // console.log(event.data.object.refunded)
        // console.log(event.data.object.status)