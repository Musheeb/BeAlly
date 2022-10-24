const stripe = require('stripe')(process.env.STRIPE_SECRET,{
  apiVersion: '2020-08-27'
})
const { isEmail } = require('validator')
const { sign, verify } = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const fs = require('fs');

//stripe dbs 
const payment_all_details = require('../../models/paymentalldetails');
const payment_success = require('../../models/payment_success');
const payment_failed = require('../../models/payment_failed');
const payment_obj_id = require('../../models/payment_objid');
const active_plan = require('../../models/active_plan');


const adminSignup = require('../../models/admin_register')
const EventCategory = require('../../models/event_category')
const userInfo = require('../../models/user')
const event = require('../../models/event');
const sub_transaction = require('../../models/transaction')
const Notification_Schema = require('../../models/notification')
const userToken = require('../../models/userToken')
const firebase_admin = require("firebase-admin");
const firebase_secret = require("../../config/firbase_secret.json");
const plan_products = require('../../models/plan_product')
const subscripiton_plan = require('../../models/subscription_plan');
firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert(firebase_secret)
});


const addadmin = async (req, res, next) => {
  try {
    let name = req.body.admin_name
    let email = req.body.email
    let password = req.body.password
    let profile_photo = req.body.image
    let body = req.body
    if (name == "" || email == "" || password == "") {
      res.status(404).send({ msg: req.t('Empty_Feild') })
    } else {
      const emailvalid = isEmail(req.body.email)
      if (!emailvalid) {
        res.status(404).send({ msg: req.t('Email_Correct') })
      } else {
        let emaildata = await adminSignup.findOne({ email: req.body.email });
        if (emaildata !== null) {
          res.status(404).send({ msg: req.t('Email_Validation') })
        } else {
          if (profile_photo == "") {
            const data = await adminSignup.create(body)
            res.status(200).json({
              messege: req.t('Data_Add'),
              data: data
            })
          } else {
            body.profile_photo = 'images/' + req.file.filename
            const data = await adminSignup.create(body)
            res.status(200).json({
              messege: req.t('Data_Add'),
              data: data
            })
          }
        }
      }
    }
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}

const login = async (req, res, next) => {
  try {
    await adminSignup.findOne({ email: req.body.email }, async (err, result) => {
      if (result == null) {
        res.json({ message: req.t('Login_Invalid') })
      } else {
        const pwd = await bcrypt.compare(req.body.password, result.password);
        if (pwd) {
          const jsontoken = sign({
            _id: result._id, email: result.email
          }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "30m"
          });
          return res.json({
            success: 1,
            message: req.t('Login_Success'),
            data: result,
            token: jsontoken
          });
        } else {
          return res.json({
            success: 0,
            message: req.t('Login_Invalid')
          });
        }
      }
    }
    ).clone()

  } catch (error) {
    res.send(error.message)
  }

}
const getadmin = async (req, res, next) => {
  try {
    const admin_data = await adminSignup.findOne().clone()
    res.status(200).json({
      success: 1,
      data: admin_data
    })
  } catch (error) {
    res.json(error.message)
  }
}
const update_admin = async (req, res, next) => {
  try {
    let name = req.body.admin_name;
    let email = req.body.email
    let image = req.body.image
    const update = {
      admin_name: name,
      email: email,
      image: image
    }
    const admin_data = await adminSignup.findOne().clone()
    if (name == "" || email == "") {
      res.status(404).send({ msg: req.t('Empty_Feild') })
    } else {
      const emailvalid = isEmail(req.body.email)
      if (!emailvalid) {
        res.status(404).send({ msg: req.t('Email_Correct') })
      } else {
        if (!req.file) {
          // console.log("without file")
          const updated_data = await adminSignup.findByIdAndUpdate(admin_data._id, { admin_name: name, email: email })
          res.status(200).json({
            success: 1,
            message: req.t('Profile_Update'),
            data: updated_data
          })
        }
        else {
          // console.log("with file")
          update.image = 'Images/' + req.file.filename
          const updated_data = await adminSignup.findByIdAndUpdate(admin_data._id, update)
          res.status(200).json({
            success: 1,
            message: req.t('Profile_Update'),
            data: updated_data
          })
        }
      }
    }
  } catch (error) {
    res.json(error.message)
  }
}
const change_password = async (req, res, next) => {
  try {
    let token = req.get("Authorization");
    if (token) {
      token = token.slice(7);
      verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err) {
          return res.status(401).json({
            success: 0,
            message: req.t('Invalid_Token')
          });
        } else {
          const old_password = req.body.current_password;
          const new_password = req.body.new_password;
          const confirm_password = req.body.confirm_password;
          adminSignup.findOne({ "email": decode.email }, async (err, result) => {
            if (result != null) {
              const hash = result.password;
              const pwd = bcrypt.compareSync(old_password, hash)
              if (pwd) {
                if (new_password == confirm_password) {
                  result.password = new_password
                  const data = await result.save()
                  res.json({
                    success: 1,
                    message: req.t('Change_Pass_Success')
                  })
                }
                else {
                  res.json({
                    success: 0,
                    message: req.t('New_Pass_Conf_Pass_Not_Match')
                  })
                }
              } else {
                res.json({
                  success: 0,
                  message: req.t('Pass_Not_Match')
                })
              }

            } else {
              res.json({
                success: 0,
                message: req.t('User_Not_Found')
              })
            }
          })
        }
      });
    } else {
      return res.status(401).json({
        success: 0,
        message: req.t('Unauthorized_User')
      });
    }
  } catch (error) {
    res.send(error.message)
  }
}

const manage_category = async (req, res, next) => {
  try {
    let name = req.body.category_name;
    let picture = req.body.image
    let Event = new EventCategory({
      name: name,
      picture: picture
    })
    if (name == '' || picture == '') {
      res.status(404).send({ message: "Category Name And Category Image Compulsory Required" })
    } else {
      Event.picture = 'Images/' + req.file.filename
      const event_data = await Event.save()
      res.status(200).json({
        success: 1,
        message: req.t('Event_Add'),
        Data: event_data
      })
    }

  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const event_category_list = async (req, res, next) => {
  try {
    const category_list = await EventCategory.find().clone()
    res.status(200).json({
      success: 1,
      message: "All Event Category List",
      data: category_list
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const event_category_list_by_id = async (req, res, next) => {
  try {
    const event_by_id = await EventCategory.findById(req.params._id)
    res.status(200).json({
      success: 1,
      message: "All Event Category List",
      data: event_by_id
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const delete_category = async (req, res, next) => {
  try {
    const deleted_data = await EventCategory.findByIdAndDelete(req.params._id)
    fs.rmSync(`./public/images/${deleted_data.picture.slice(29)}`, {
      force: true,
    })
    res.status(200).json({
      success: 1,
      message: req.t('Delete_Category'),
      data: deleted_data
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const update_category = async (req, res, next) => {
  try {
    let name = req.body.category_name;
    let picture = req.body.image
    const update = {
      name: name,
      picture: picture
    }
    if (name == '') {
      res.status(404).send({ message: "Category Name And Category Image Compulsory Required" })
    } else {
      if (!req.file) {
        const updated_data = await EventCategory.findByIdAndUpdate(req.params._id, { name: name })
        res.status(200).json({
          success: 1,
          message: req.t('Event_Update'),
          Data: updated_data
        })
      } else {
        update.picture = 'Images/' + req.file.filename
        const updated_data = await EventCategory.findByIdAndUpdate(req.params._id, update)
        res.status(200).json({
          success: 1,
          message: req.t('Event_Update'),
          Data: updated_data
        })
      }
    }
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const stauts_change = async (req, res, next) => {
  try {
    const change_status = await EventCategory.findByIdAndUpdate(req.params._id, { is_subscription: req.body.is_subscription })
    res.status(200).json({
      success: 1,
      message: `${change_status.name} is Successfully Subscription type`,
      data: change_status
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const getUser = async (req, res, next) => {
  try {
    const page = parseInt(req.body.page) - 1 || 0;
    const limit = parseInt(req.body.limit) || 5;
    const search = req.body.search || "";

    const user_data = await userInfo.find({
      "$or": [{
        'username': { $regex: '.*' + search + '.*', $options: "i" }
      }, {
        'email': { $regex: '.*' + search + '.*', $options: "i" }
      }]
    })
      .sort({ username: 1 })
      .skip(page * limit)
      .limit(limit);

    const total = await userInfo.countDocuments(
      {
        "$or": [{
          'username': { $regex: '.*' + search + '.*', $options: "i" }
        }, {
          'email': { $regex: '.*' + search + '.*', $options: "i" }
        }]
      }
    );

    const response = {
      total,
      current_page: page + 1,
      limit,
      total_Page: Math.ceil(total / limit),
      user_data
    };
    res.status(200).json(response);
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const user_status = async (req, res, next) => {
  try {
    const blockUser = await userInfo.findByIdAndUpdate(req.params._id, { is_blocked: req.body.status }).exec()
    // console.log(req.body.status)
    res.status(200).json({
      success: 1,
      message: req.t('Status_Update'),
      data: blockUser
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const delete_user = async (req, res, next) => {
  try{
    const param_id = req.params._id;

    const find_user = await userInfo.findOne({_id:param_id});

    if(find_user){
        const delete_events = await event.deleteMany({user_id:find_user._id});

        const delete_user_details = await userInfo.updateOne(
            {_id:find_user._id},
            {$unset:{
                "email": 1,
                "password": 1,
                "mobile_number": 1,
                "address": 1,
                "age": 1,
                "device_id": 1,
                "device_type": 1,
                "dob": 1,
                "fcm_token": 1,
                "gender": 1,
                "intrested_category": 1,
                "is_blocked": 1,
                "is_social": 1,
                "otp": 1,
                "profile_picture": 1,
            }}
        );

        if(delete_user_details.modifiedCount == 1){
            await userInfo.updateOne(
                {_id:find_user._id},
                {$set:{is_deleted: true}}
            );
        }

        res.status(200).json({
            Status : req.t('successfull_status'),
            Response : req.t('account_has_been_deleted_successfully'),
            Events_Deleted : delete_events,
            UpdateUnset : delete_user_details
        });
    }else{
        res.status(400).json({
            Status: req.t('unsuccessfull_status'),
            Response: req.t('invalid_user_id_in_params')
        });
    }
    
}catch(error){
    res.status(400).json({
        Error_Message : error.message
    });
}
}
const transaction = async (req, res, next) => {
  try {
    const body = new sub_transaction(req.body)
    const tran_data = await sub_transaction.create(req.body)
    res.status(200).json({
      success: 1,
      tran_data
    })

  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const getTransaction = async (req, res, next) => {
  try {
    const start_date = req.body.start_date
    const end_date = req.body.end_date
    let query = [{
      $project:{

        _v:0
      }
    }]
    if (start_date != '' && end_date != '') {
      query.push({
        $match: { transaction_date: { $gte: new Date(start_date), $lte: new Date(end_date) } }
      })
    }
    const trans_data = await active_plan.aggregate(query)
    res.status(200).json({
      success: 1,
      data: trans_data
    })

  } catch (error) {
    res.json({
      message: error.message
    })
  }

}
const addNotification = async (req, res, next) => {
  try {
    let title = req.body.title;
    let image = req.body.image
    let content = req.body.content
    let Notification = new Notification_Schema({
      title: title,
      content: content,
      banner_image: image
    })
    if (title == '' || content == '') {
      res.status(404).send({ message: "Title And Content Compulsory Required" })
    } else {
      if (!req.file) {
        const add_notification = await Notification_Schema.create(req.body)
        res.status(200).json({
          success: 1,
          data: add_notification,
          message: 'Notification Successfully Add'
        })
      } else {
        Notification.banner_image = 'Images/' + req.file.filename
        const add_notification_with_banner = await Notification.save()
        res.status(200).json({
          success: 1,
          data: add_notification_with_banner,
          message: 'Notification Successfully Add'
        })
      }
    }
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const getNotification = async (req, res, next) => {
  try {
    const Notification_list = await Notification_Schema.find().clone()
    res.status(200).json({
      success: 1,
      Notification_list
    })

  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const deleteNotification = async (req, res, next) => {
  try {
    const delete_data = await Notification_Schema.findByIdAndDelete(req.params._id)
    res.status(200).json({
      success: 1,
      message: req.t('Delete_Notification'),
      data: delete_data
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const sendNotification = async (req, res, next) => {
  try {
    let tokens = []
    const users = await userInfo.find().clone()
    for (let user of users) {
      if (user.fcm_token != undefined) {
        tokens.push(user.fcm_token)
      }
    }
    const noti_data = await Notification_Schema.findById(req.params._id)
    if (!noti_data.banner_image) {
      const message_without_image = {
        notification: {
          title: noti_data.title,
          body: noti_data.content
        },
        tokens: tokens
      }
      firebase_admin.messaging().sendMulticast(message_without_image).then(result => {
        res.status(200).json({
          success: 1,
          message: "Notification Send All Users Successfully",
          data: result
        })
      }).catch(err => {
        res.json({
          message: err.message
        })
      })
    } else {
      const message_with_image = {
        notification: {
          title: noti_data.title,
          body: noti_data.content,
          image: process.env.API_URL+noti_data.banner_image
        },
        tokens: tokens
      }
      firebase_admin.messaging().sendMulticast(message_with_image).then(result => {
        res.status(200).json({
          success: 1,
          message: "Notification Successfully Sent",
          data: result
        })
        // console.log(result)
      }).catch(err => {
        res.json({
          message: err.message
        })
      })
    }
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const create_subscription_plan = async (req, res, next) => {
  try {

    let product_id = req.body.product_id
    let plan_id = req.body.plan_id
    let interval_count = req.body.interval_count
    let product_name = req.body.name
    let plan_name = req.body.plan_name
    let amount = req.body.amount
    let interval = req.body.interval
    let currency = req.body.currency
    let description = req.body.description
    let quarterly = req.body.quarterly
    let active = req.body.active
    // console.log(quarterly)
    let plan = new subscripiton_plan({
      plan_id: plan_id,
      product_id: product_id,
      product_name: product_name,
      plan_name: plan_name,
      amount: amount,
      interval: interval,
      interval_count: interval_count,
      currency: currency,
      description: description,
      isActive:active
    })
    // console.log(active);
    if (quarterly == 'true') {
      const product = await plan_products.findOne().where({ product_id: product_id }).clone()
      plan.product_name = product.name
      plan.interval_count = 3
      const create_plan = await stripe.prices.create({
        unit_amount: amount * 100,
        currency: currency,
        recurring: { interval: interval, interval_count: 3 },
        product: product_id,
        active:active
      }).then(async result => {
        plan.plan_id = result.id
        const plan_save = await plan.save()
        res.status(200).json({
          success: 1,
          message: "Plan Created Successfully",
          data: result
        })
      }).catch(error => {
        res.json({
          message: error.message
        })
      });
    } else {
      const product = await plan_products.findOne().where({ product_id: product_id }).clone()
      plan.product_name = product.name
       const create_plan = await stripe.prices.create({
        unit_amount: amount * 100,
        currency: currency,
        recurring: {interval: interval},
        product: product_id,
        active:active
      }).then(async result => {
        plan.plan_id = result.id
        const plan_save = await plan.save()
        res.status(200).json({
          success: 1,
          message: "Plan Created Successfully",
          data: result
        })
      }).catch(error => {
        res.json({
          message: error.message
        })
      });
    }
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const create_product = async (req, res, next) => {

  try {
    product_name = req.body.product_name
    image = req.body.image
    // console.log(product_name)
    let products = new plan_products({
      name: product_name,
      image: image
    })
    if (product_name == '') {
      res.status(404).send({ message: "Product Name is Required" })
    } else {
      if (!req.file) {
        const save_product = await products.save()
        const product = await stripe.products.create({
          name: product_name
        }).then(async result => {
          const update_product = await plan_products.updateOne({ name: result.name }, { product_id: result.id })
          res.status(200).json({
            success: 1,
            message: "Product Successfully Add",
            data: result
          })
        }).catch(error => {
          res.json({
            message: error.message
          })
        });
      } else {
        products.image = 'Images/' + req.file.filename
        let imageArray = []
        const product_with_file = await products.save()
        imageArray.push(process.env.API_URL + product_with_file.image)
        const product = await stripe.products.create({
          name: product_name,
          images: imageArray
        }).then(async result => {
          const update_product = await plan_products.updateOne({ name: result.name }, { product_id: result.id })
          res.status(200).json({
            success: 1,
            message: "Product Successfully Add",
            data: result
          })
        }).catch(error => {
          res.json({
            message: error.message
          })
        });
      }
    }

  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const getProduct = async (req, res, next) => {
  try {
    const product_list = await plan_products.find().clone()
    res.status(200).json({
      success: 1,
      message: "Product List",
      data: product_list
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const getPlan = async (req, res, next) => {
  try {
    const plan_list = await subscripiton_plan.find().clone()
    res.status(200).json({
      success: 1,
      message: 'Plan List',
      data: plan_list
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const getPlanById = async (req, res, next) => {
  try {
    const plan = await subscripiton_plan.findOne({plan_id:req.params._id}).clone()
    res.status(200).json({
      success: 1,
      message: 'Plan List',
      data: plan
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}
const active_deactive = async (req, res, next) => {
  try {
   
    let plan_id = req.params.plan_id
    let active = req.body.active
  
    const updated_data = await stripe.prices.update(
      plan_id,
      {active:active}
    ).then(async result => {
      const plan_update = await subscripiton_plan.updateOne({plan_id:plan_id},{isActive:active})
      res.status(200).json({
        success: 1,
        message: "Plan Updated",
        data: result
      })
    }).catch(error => {
      res.json({
        message: error.message
      })
    });
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}

const deletePlan = async(req,res,next)=>{
  try {
    const plan_id =req.params.plan_id
    const deletePlan = await stripe.plans.del(
      plan_id
    ).then(async result=>{
      const delete_plan = await subscripiton_plan.deleteOne({plan_id:plan_id})
      res.status(200).json({
        success: 1,
        message: "Plan Deleted",
        data: result
      })
    }).catch(error=>{
      res.json({
        message: error.message
      })
    });
    
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}

const webhooks_handler = async (req, res, next) => {

  let siginin_secret =process.env.SIGNING_SECRET

  const sign= req.headers['stripe-signature']
  // console.log(sign)
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sign, siginin_secret)

  } catch (error) {
    console.log(error.message)
    res.status(400).json({ success: false })
    return;
  }

  //variables
  let base
  let data
  let obj_data
  let charge_time
  let subsc_data
  let sub_st_date 
  let sub_end_date
  let subs_name
  


  switch (event.type) {

    case "customer.created":
      console.log(event.type)
      break;

    case "payment_intent.created":
      console.log(event.type)
      break;

    case "customer.updated":
      console.log(event.type)
      break;
      
    case "invoice.created":
      console.log(event.type)
      break;
      
    case "invoice.finalized":
      console.log(event.type)
      break;

    case "customer.subscription.created":
      console.log(event.type)
      break;

    case "charge.succeeded":
      console.log(event.type)
      base = event.data.object;
      charge_time = new Date(base.created * 1000);
      data = {
        charge_success_obj_id : base.id,
        payment_object : base.object,
        amount : base.amount,
        amount_captured : base.amount_captured,
        amount_refunded : base.amount_refunded,
        user_email : base.billing_details.email,
        user_name : base.name, 
        captured : base.captured,
        charge_created_date : charge_time,
        currency : base.currency,
        customer_id : base.customer,
        invoice_id : base.invoice,
        paid : base.paid,
        payment_method_id : base.payment_method,
        payment_card_brand : base.payment_method_details.card.brand,
        card_country : base.payment_method_details.card.country,
        card_exp_month : base.payment_method_details.card.exp_month,
        card_exp_year : base.payment_method_details.card.exp_year,
        payment_card_last_4_digits : base.payment_method_details.card.last4,
        receipt_url : base.receipt_url,
        refunded : base.refunded,
        status : base.status,
      }

      obj_data = {
        Payment_obj_id : base.id,
        Payment_customer_id: base.customer,
      }

      const find_user = await userInfo.findOne({email:base.billing_details.email});
      // console.log(find_user.email);

      subsc_data = {
        success_obj_id : base.id,
        user_email : base.billing_details.email,
        user_name : find_user.username,
        customer_id : base.customer,
        plan_amount : base.amount,
        payment_card_brand : base.payment_method_details.card.brand,
        receipt_url : base.receipt_url,
        payment_status : base.status,
      }
      

      const saved_succeded = await payment_success.create(data);
      const saved_payment_id = await payment_obj_id.create(obj_data);
      const saved_subs_data = await active_plan.create(subsc_data);

      if(base.status == "succeeded"){
        const update_to_subscribed = await userInfo.updateOne(
          {email:base.billing_details.email},
          {$set:{is_subscribed:true}}
        );
      }
      break;

    case "payment_intent.succeeded":
      console.log(event.type)
      break;

    case "payment_method.attached":
      console.log(event.type)
      break;

    case "invoice.updated":
      //could save all object in db from this event
      console.log(event.type)
      break;

    case "customer.subscription.updated":
      //have to save all data from here
      console.log(event.type)


      base = event.data.object;
      subs_date = new Date(base.created * 1000);
      sub_st_date = new Date(base.current_period_start * 1000);
      sub_end_date = new Date(base.current_period_end * 1000);

      // console.log(base.status);

      if(base.status == "inactive"){

        const update_user = await userInfo.updateOne(
          {strip_customer_id : base.customer},
          {$set:{is_subscribed : false}}
        );

      }else{
        const plan_id_str = base.items.data.map(obj => obj.plan.id);
        const product_id_str = base.items.data.map(obj => obj.plan.product);
        const subs_interval_str = base.items.data.map(obj => obj.plan.interval);
        const subs_interval_count = base.items.data.map(obj => obj.plan.interval_count);
        const subs_id_str = base.items.data.map(obj => obj.subscription);
        
        data = {
          all_payment_details : base
        }

        const find_plan = await subscripiton_plan.findOne({plan_id : plan_id_str.toString()});
        // console.log(find_plan);
        if(find_plan.interval_count === 3){
          subs_name = "quarter"
        }else{
          subs_name = subs_interval_str.toString()
        }

        const update_subs = await active_plan.updateOne(
          {customer_id : base.customer},
          {$set:{
            subscription_obj_id : base.id,
            subscription_created_date : base.charge_time,
            subscription_start_date : sub_st_date,
            subscription_end_date : sub_end_date,
            plan_id : plan_id_str.toString(),
            plan_name : find_plan.plan_name,
            product_id : product_id_str.toString(),
            subscription_interval : subs_name,
            subscription_id : subs_id_str.toString(),
            subscription_status : base.status,
            transaction_date : subs_date
          }}
        );

        const to_string = subs_id_str.toString()

        const find_cust_email = await payment_success.findOne({customer_id : base.customer});

        if(subs_interval_str.toString() == "month" && parseInt(subs_interval_count) == 1){

          const update_user_monthly = await userInfo.updateOne(
            {email:find_cust_email.user_email},
            {$set:{strip_customer_id : base.customer}}
          );
          // console.log(update_user_monthly);

        }else if(subs_interval_str.toString() == "month" && parseInt(subs_interval_count) == 3){
          console.log(subs_id_str.toString());
          const update_user_quarterly = await userInfo.updateOne(
            {email : find_cust_email.user_email},
            {$set:{strip_customer_id : base.customer}}
          );
          // console.log(update_user_quarterly);

        }else if(subs_interval_str.toString() == "year"){
          const update_user_yearly = await userInfo.updateOne(
            {email : find_cust_email.user_email},
            {$set:{strip_customer_id : base.customer}}
          );
        }
        const saved_all = await payment_all_details.create(data);
      }

      break;
      

    case "invoice.paid":
      //got nothing special
      console.log(event.type)
      break;

    case "invoice.payment_succeeded":
      //got nothing special from here as well
      console.log(event.type)
      break;

    case "checkout.session.completed":
      console.log(event.type)
      break;

      ///* failed payment starts here(Below) *///

    case "charge.failed":
      console.log(event.type)
      base = event.data.object;
      charge_time = new Date(base.created * 1000);
      data = {
        charge_failed_obj_id : base.id,
        payment_object : base.object,
        amount : base.amount,
        amount_captured : base.amount_captured,
        customer_email : base.billing_details.email,
        customer_name : base.billing_details.name,
        captured : base.captured,
        cancellation_time : charge_time,
        currency : base.currency,
        customer_id : base.customer,
        failure_code : base.failure_code,
        failure_message : base.failure_message,
        invoice_id : base.invoice,
        paid : base.paid,
        payment_method_id : base.payment_method,
        payment_card_brand : base.payment_method_details.card.brand,
        card_country : base.payment_method_details.card.country,
        card_exp_month : base.payment_method_details.card.exp_month,
        card_exp_year : base.payment_method_details.card.exp_year,
        payment_card_last_4_digits : base.payment_method_details.card.last4,
        refunded : base.refunded,
        status : base.status,
      }

      const saved_failed = await payment_failed.create(data);

      break;

    case "customer.subscription.deleted":
      console.log(event.type)
      base = event.data.object;
      // console.log(base)
      const update_user = await userInfo.updateOne(
        {strip_customer_id : base.customer},
        {$set:{is_subscribed : false}}
      );


      break;


    default:
      console.log("this is default case and this event is not in switch case:- " + event.type)
  }
}

const update_plan = async(req,res,next)=>{
  try {
    const update_data = await subscripiton_plan.updateOne({plan_id:req.params.plan_id},{plan_name:req.body.plan_name,description:req.body.description})
    res.status(200).json({
      success: 1,
      message: "Plan Updated",
      data: update_data
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}

const count_user = async(req,res,next)=>{
  try {
    const user_data = await userInfo.find().clone()
    res.status(200).json({
      success: 1,
      message: "All Usern Data",
      data: user_data
    })
  } catch (error) {
    res.json({
      message: error.message
    })
  }
}


const get_all_payment_data = async(req,res,next) =>{
  try{

    const get_success = await payment_success.find();
    const get_failed = await payment_failed.find();

    res.status(200).json({
      Status : req.t('successfull_status'),
      Response : req.t('payment_all_data_below'),
      Data:{
        Succeded_Transactions_All_Data : get_success,
        Failed_Transactions_All_Data : get_failed
      }
    });
    
  } catch(error){
    res.status(400).json({
      Error_Message : error.message
    });
  }
}


module.exports = {
  addadmin,
  login,
  getadmin,
  update_admin,
  change_password,
  manage_category,
  event_category_list,
  event_category_list_by_id,
  delete_category,
  update_category,
  stauts_change,
  getUser,
  user_status,
  delete_user,
  transaction,
  getTransaction,
  addNotification,
  getNotification,
  deleteNotification,
  sendNotification,
  create_subscription_plan,
  create_product,
  getProduct,
  getPlan,
  getPlanById,
  update_plan,
  deletePlan,
  webhooks_handler,
  active_deactive,
  count_user,
  get_all_payment_data,
}