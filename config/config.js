const mongoose = require('mongoose');

module.exports = mongoose.connect('mongodb://127.0.0.1:27017/BeAlly', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
    .then((success) => {
        console.log("Database connected");
    })
    .catch((error) => {
        console.log("Database isn't connected successfully.");
    })