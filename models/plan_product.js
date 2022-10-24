const mongoose = require('mongoose')

let current = new Date();
let timeStamp = new Date(Date.UTC(current.getFullYear(),
    current.getMonth(), current.getDate()))

const ProductSchema = new mongoose.Schema({
    created_At:{
      type:Date,
      default:timeStamp
    },
    product_id:{
        type:String
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:String
    },
    updated_At:{
        type:Date,
        default:timeStamp
      }
});

module.exports = mongoose.model('stripe_products',ProductSchema);