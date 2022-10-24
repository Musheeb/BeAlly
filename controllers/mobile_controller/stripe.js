const stripe = require('stripe')(process.env.STRIPE_SECRET,{
    apiVersion: '2020-08-27'
});

const subscription_plan = require('../../models/subscription_plan');
const user = require('../../models/user');
const payment_success = require('../../models/payment_success');
const active_plan = require('../../models/active_plan');
const payment_obj_id = require('../../models/payment_objid');
const payment_all_details = require('../../models/paymentalldetails');


exports.getAllPlans = async(req, res, next)=>{
    try{
        const param_id = req.params._id;

        const find_user = await user.findOne({_id:param_id});

        if(find_user){
            // console.log(find_user);
            const getPlan = await subscription_plan.find();

            if(getPlan){
                res.status(200).json({
                    Status:req.t('successfull_status'),
                    Response:req.t('all_plans_are_given_below'),
                    Data:getPlan
                });
            }else{
                res.status(400).json({
                    Status:req.t('unsuccessfull_status'),
                    Response:req.t('no_plan_is_present')
                });
            }

        }else{
            res.status(400).json({
                Status:req.t('unsuccessfull_status'),
                Response:req.t('invalid_user_id_in_params')
            });
        }

    } catch(error){
        res.status(400).json({
            Error_Message : error.message
        });
    }
}


exports.subscribe = async(req,res,next)=>{
    try{
        // console.log(req.new_email);
        // console.log(req.new_password);
        const param_id = req.params._id;
        const find_user = await user.findOne({_id:param_id});

        if(find_user){

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                success_url:'http://localhost:3000/success.html',
                cancel_url:'http://localhost:3000/cancel.html',
                client_reference_id:find_user._id,
                line_items:[{
                    price: req.body.plan_id,
                    quantity: 1
                }],
                customer_email:find_user.email,
                mode:'subscription'
            });
            res.status(201).json({
                Status : req.t('successfull_status'),
                Response: req.t('url_has_been_generated') ,
                Data:session
            });
        }else{
            res.status(400).json({
                Status:req.t('unsuccessfull_status'),
                Response:req.t('invalid_user_id_in_params')
            });
        }

    } catch(error){
        res.status(400).json({
            Error_Message : error.message
        });
    }
}



exports.active_plan_details = async(req,res,next)=>{
    try{
        const param_id = req.params._id;

        const find_user = await user.findOne({_id:param_id});

        if(find_user){

            if(find_user.is_subscribed == true){
                const find_active = await active_plan.aggregate([
                    {
                        $match:{
                            $and:[
                                {user_email : find_user.email},
                                {customer_id: find_user.strip_customer_id}
                            ]
                        }
                    },
                    {
                        $lookup : {
                            from : 'stripe_plans',
                            localField : 'plan_id',
                            foreignField : 'plan_id',
                            as : "Plan_Details"
                        }
                    }
                ]);
                res.status(200).json({
                    Status : req.t('successfull_status'),
                    Response : req.t('all_subscription_details_is_given_below'),
                    Data : find_active
                });
            }else{
                res.status(400).json({
                    Status:req.t('unsuccessfull_status'),
                    Response:req.t('user_not_subscribed_yet')
                });
            }



            // const find_active_plan = await active_plan.find(
            //     {
            //     user_email : find_user.email,
            //     customer_id: find_user.strip_customer_id
            // }
            // );
            // console.log(find_active_plan);


            // const get_customer = await payment_success.findOne({user_email: find_user.email});
            // // console.log(typeof(get_customer));
            // const get_obj_id = await payment_obj_id.findOne({
            //     Payment_customer_id : get_customer.customer_id,
            //     Payment_obj_id : get_customer.charge_success_obj_id
            // });
            // const customer_email = get_customer.user_email;

            // const all_details = await payment_all_details.find({"all_payment_details.customer" : toString(get_customer.customer_id)});

            // console.log(all_details);
            // console.log(get_customer.customer_id);
            // console.log("1212");









            // if(asdf ){
            //     const get_cust_str_id = get_customer.customer_id;
            // console.log(get_cust_str_id);

            // }




        }else{
            res.status(400).json({
                Status:req.t('unsuccessfull_status'),
                Response:req.t('invalid_user_id_in_params')
            });
        }

    } catch(error){
        res.status(400).json({
            Error_Message : error.message
        });
    }
}



exports.cancel_subscription = async(req,res,next)=>{
    try{
        const param_id = req.params._id;

        const find_user = await user.findOne({_id : param_id});
        if(find_user){
            const find_subs_id = await active_plan.findOne({customer_id : find_user.strip_customer_id});
            // console.log(find_subs_id.subscription_id);

            const cancel_subs = await stripe.subscriptions.update(
                find_subs_id.subscription_id,
                {cancel_at_period_end: true}
                );

            // console.log(cancel_subs);

            res.status(200).json({
                Status : req.t('successfull_status'),
                Response : req.t('plan_unsubscribed_successfully')
            });
        }else{
            res.status(400).json({
                Status:req.t('unsuccessfull_status'),
                Response:req.t('invalid_user_id_in_params')
            });
        }

    } catch(error){
        res.status(400).json({
            Error_Message : error.message
        });
    }
}

// exports.webhook = async(req,res, next)=>{
//     let event
//     try{

//         const signing_secret = process.env.SIGNING_SECRET;
//         const payload = req.body;
//         const sig = req.headers['stripe-signature'];

//         // console.log(req.body)
//         if(sig == null){
//             console.log("this is going into sig not found.")
//             throw new Error('Stripe signature not found.')
//         }else{
//             event = await stripe.webhooks.constructEvent(payload,sig,signing_secret);
//             res.status(200).json({
//                 Status: req.t('successfull_status'),
//                 Response: "This is webhook route and it is working.",
//                 Data:event
//             });
//         }


//     } catch(error){
//         res.status(400).json({
//             Error_Mesage : error.message
//         });
//     }
// }