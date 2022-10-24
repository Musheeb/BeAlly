const mongoose = require('mongoose');

const AllPaymentDetails = new mongoose.Schema({
    all_payment_details : {
        type : Object
    }
},{
    timestamps : true
});

module.exports = mongoose.model('payment-all',AllPaymentDetails);