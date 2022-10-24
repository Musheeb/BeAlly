const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

let current = new Date();
let timeStamp = new Date(Date.UTC(current.getFullYear(),
    current.getMonth(), current.getDate()))

const AdminSchema = new mongoose.Schema({
    created_At: {
        type: Date,
        default: timeStamp
    },
    admin_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Email address is required'],
        validate: [isEmail, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    updated_At: {
        type: Date,
        default: timeStamp
    }
},
);

AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next()
    this.password = await bcrypt.hash(this.password, 10)
    return next()
})

module.exports = mongoose.model('admin', AdminSchema,);
