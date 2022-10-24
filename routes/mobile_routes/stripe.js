const router = require('express').Router();
const bodyParser = require('body-parser');


const verify_token = require('../../middleware/user_autenticate');

const {
    getAllPlans,
    subscribe,
    webhook,
    active_plan_details,
    cancel_subscription,

} = require('../../controllers/mobile_controller/stripe');

router.get('/getAllPlans/:_id',verify_token,getAllPlans);
router.post('/subscribe/:_id',verify_token,subscribe);
// router.post('/webhook',bodyParser.raw({type:"application/json"}),webhook);
router.get('/getAllSubscriptionDetails/:_id',verify_token,active_plan_details);
router.post('/cancelSubscription/:_id',verify_token,cancel_subscription);

module.exports = router;