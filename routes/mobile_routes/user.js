const router = require('express').Router();

const verify_token = require('../../middleware/user_autenticate');

//remove this
const {
    dummy,
} = require('../../controllers/mobile_controller/dummy');

// const upload_mid = require('../Middlewares/autenticate');
const create_profile_image = require('../../middleware/images_upload');
const {
    user_registration,
    user_login,
    resend_otp_for_email_registration,
    verify_otp,
    forget_password,
    change_password,

    create_user_profile,
    user_profile_info,
    user_self_created_events,
    user_saved_categories,
    get_all_saved_categories,

} = require('../../controllers/mobile_controller/user');

router.post('/registration', user_registration);
router.post('/login', user_login);
router.get('/resendotp/:_id', resend_otp_for_email_registration);
router.post('/verifyOTP/:_id', verify_otp);
router.post('/forgetpassword', forget_password);
// router.post('/verifyOTPforforgetpassword/:_id', verify_otp_for_forget_password);
router.post('/changePassword/:_id', change_password);

router.post('/createOrUpdateUserProfile/:_id', create_profile_image.single('profile_picture'), verify_token, create_user_profile);
router.get('/getUserProfile/:_id',verify_token,user_profile_info);
router.get('/getAllSelfCreatedEvents/:_id',verify_token,user_self_created_events);
router.post('/userSavedCategories/:_id',verify_token,user_saved_categories);
router.get('/getAllSavedCategories/:_id',verify_token,get_all_saved_categories);

//remove this
router.post('/dummyUser',dummy);



module.exports = router;