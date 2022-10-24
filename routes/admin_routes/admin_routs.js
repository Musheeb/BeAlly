const router = require('express').Router(); 
const get = require('multer')()
const admin = require('../../controllers/admin_controller/admincontroller')
const checkToken = require('../../middleware/admin_awthenticate')
const profile = require('../../middleware/images_upload')
const bodyParser = require('body-parser');

router.post('/add_admin',profile.single('image'),admin.addadmin)

router.post('/admin_login',get.any(),admin.login)

router.post('/adminProfile',get.any(),admin.getadmin)

router.post('/updateProfile',profile.single('image'),admin.update_admin)

router.post('/change_password',checkToken,get.any(),admin.change_password)

router.post('/add_event',checkToken,profile.single('image'),admin.manage_category)

router.post('/event_category_list',checkToken,admin.event_category_list)

router.post('/event_category_list_by_id/:_id',checkToken,admin.event_category_list_by_id)

router.delete('/delete_category/:_id',checkToken,admin.delete_category)

router.post('/update_category/:_id',profile.single('image'),checkToken,admin.update_category)

router.post('/change_subscripition/:_id',get.any(),checkToken,admin.stauts_change)

router.post('/getUser',get.any(),checkToken,admin.getUser)

router.post('/userStatus/:_id',get.any(),checkToken,admin.user_status)

router.delete('/userDelete/:_id',checkToken,admin.delete_user)

router.post('/transaction',get.any(),checkToken,admin.transaction)

router.post('/transaction_details',get.any(),checkToken,admin.getTransaction)

router.post('/addNotification',profile.single('image'),checkToken,admin.addNotification)

router.post('/getNotification',checkToken,admin.getNotification)

router.delete('/deleteNotification/:_id',checkToken,admin.deleteNotification)

router.post('/sendNotification/:_id',checkToken,admin.sendNotification)

router.post('/create_subscription_plan/:_id',checkToken,admin.create_subscription_plan)

router.post('/create_subscription_plan/:_id',checkToken,admin.create_subscription_plan)

router.post('/createProduct/',profile.single('image'),checkToken,admin.create_product)

router.post('/createPlan/',get.any(),checkToken,admin.create_subscription_plan)

router.post('/getProduct/',get.any(),checkToken,admin.getProduct)

router.post('/getPlan/',get.any(),checkToken,admin.getPlan) 

router.post('/getPlanById/:_id',get.any(),checkToken,admin.getPlanById) 

router.post('/deletePlan/:plan_id',get.any(),checkToken,admin.deletePlan) 

router.post('/webhooks',bodyParser.raw({type:'application/json'}),admin.webhooks_handler)

router.post('/active_deactive/:plan_id',get.any(),checkToken,admin.active_deactive)

router.post('/updatePlan/:plan_id',get.any(),checkToken,admin.update_plan)

router.post('/getUserCount',get.any(),checkToken,admin.count_user)

router.post('/getAllPaymentDetails',checkToken,admin.get_all_payment_data)



module.exports = router;