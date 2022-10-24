const router = require('express').Router();

const verify_token = require('../../middleware/user_autenticate');
const event_upload = require('../../middleware/images_upload');
const user_is_subscribed = require('../../middleware/event.issubscribed');


const get = require('multer')();

const {
    create_event,
    events_user_feed_filter,
    report_event,
    other_user_events_list,
}=require('../../controllers/mobile_controller/event');



router.post('/createEvent/:_id',verify_token,event_upload.single('picture'),user_is_subscribed,create_event);
router.post('/eventsUserFeedFilter/:_id',verify_token,events_user_feed_filter);
router.post('/reportEvent',verify_token,report_event);
router.get('/otherUserEventsList/:_id',verify_token,other_user_events_list);

module.exports = router;