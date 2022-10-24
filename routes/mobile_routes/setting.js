const router = require('express').Router();

const verify_token = require('../../middleware/user_autenticate');

const {
    contact_admin,
    delete_user,
} = require('../../controllers/mobile_controller/setting');

router.post('/contactAdmin/:_id',verify_token,contact_admin);
router.post('/deleteAccount/:_id',verify_token,delete_user);

module.exports = router;