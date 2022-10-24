const mongoose = require('mongoose');

const PaymentSuccessObjId = new mongoose.Schema({
    Payment_obj_id : {
        type : String,
    },
    Payment_customer_id : {
        type : String,
    }
});

module.exports = mongoose.model('payment-obj-id',PaymentSuccessObjId);
