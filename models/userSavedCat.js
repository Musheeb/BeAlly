const mongoose = require('mongoose');

const UserSavedCategories = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    gender_saved:{
        type:String,
    },
    age_range_saved:{
        type:Number,
    },
    time_range_saved:{
        type:Date,
    },
    location_category_saved:{
        type:Array,
    }

},
    {
        timestamps:true
    }
);


module.exports = mongoose.model('savedcategories',UserSavedCategories);