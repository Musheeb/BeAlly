const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
    token: {
        type: String
    },
},
);

module.exports = mongoose.model('userToken', tokenSchema,);
