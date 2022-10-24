const router = require('express').Router();
const verify_token = require('../../middleware/user_autenticate');


const {
    get_all_categories,

} = require('../../controllers/mobile_controller/category');

router.get('/getAllCategories/:_id',verify_token,get_all_categories);

module.exports = router;