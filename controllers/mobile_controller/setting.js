const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const user = require('../../models/user');
const event = require('../../models/event');
const contact_admin = require('../../models/contact_admin');


exports.delete_user = async(req,res,next) =>{
    try{
        const param_id = req.params._id;

        const password = req.body.password;

        const find_user = await user.findOne({_id:param_id});

        if(find_user){
            if(find_user.is_social == true){
                const delete_events = await event.deleteMany({user_id:find_user._id});

                    const delete_user_details = await user.updateOne(
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
                        await user.updateOne(
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
                const confirm_password = await bcrypt.compare(password,find_user.password); 

                if(!confirm_password){
                    res.status(400).json({
                        Status: req.t('unsuccessfull_status'),
                        Response: req.t('invalid_password')
                    });
                }else{
                    const delete_events = await event.deleteMany({user_id:find_user._id});

                    const delete_user_details = await user.updateOne(
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
                        await user.updateOne(
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
                }
            }

            
            
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





exports.contact_admin = async (req, res, next) => {
    try {
        const param_id = req.params._id;

        const body = req.body;

        const find_user = await user.findOne({ _id: param_id });

        if (find_user) {

            body.user_email = find_user.email;

            const transporter = await nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.APP_EMAIL,
                    pass: process.env.APP_PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.APP_EMAIL,
                to: process.env.ADMIN_EMAIL_SUPPORT,
                subject: body.subject,
                text: body.query
            }

            body.username = find_user.username;

            const save_in_db = await contact_admin.create(body);

            res.status(201).json({
                Status: req.t('successfull_status'),
                Response: req.t('query_send_to_admin_success'),
                Data: save_in_db
            });

            await transporter.sendMail(mailOptions);

        } else {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id_in_params')
            });
        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}


