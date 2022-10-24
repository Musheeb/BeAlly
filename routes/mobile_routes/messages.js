const router = require('express').Router();

const verify_token = require('../../middleware/user_autenticate');
const upload = require('../../middleware/images_upload');



const {
    sendMessage,
    getAllChats,
    getEverChatted,
    get_in_app_notification,
} = require('../../controllers/mobile_controller/messages');


router.post('/sendMessages/:_id',upload.single('photo_url'),verify_token,sendMessage);
router.post('/getAllMessages/:_id',verify_token,getAllChats);
router.get('/getEverChatted/:_id',verify_token,getEverChatted);
router.post('/inAppNotification/:_id',verify_token,get_in_app_notification);


module.exports = router;


