const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const { isEmail } = require('validator');

const user = require('../../models/user');
const savedcategories = require('../../models/userSavedCat');

exports.user_registration = async (req, res, next) => {
    try {
        const body = new user(req.body);
        if (body.is_social === true) {
            const fnd_email = await user.findOne({ email: body.email });
            if (fnd_email) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('email_already_exists_can_not_register_with_this_email')
                });
            } else {

                const social_saved = await body.save();

                const find_user_for_token = await user.findOne({ email: body.email });

                if (!find_user_for_token) {
                    res.status(400).json({
                        Status: req.t('unsuccessfull_status'),
                        Response: req.t('user_not_found_for_token_social_login')
                    });
                } else {
                    const generate_token_for_social = await jwt.sign({ _id: find_user_for_token.id, email: find_user_for_token.email },
                        process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '15d'
                    });
                    res.status(201).json({
                        Status: req.t('successfull_status'),
                        Response: req.t('account_registered_successfully'),
                        Data: social_saved,
                        Token: generate_token_for_social
                    });
                }
            }
        } else {

            if (!body.username || !body.email || !body.password) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('fields_can_not_be_null')
                });
            } else {
                const validate_Email = await isEmail(body.email);
                if (!validate_Email) {
                    res.status(400).json({
                        Status: req.t('unsuccessfull_status'),
                        Response: req.t('invalid_email')
                    });
                } else {
                    const email_already_exist = await user.findOne({ email: body.email });
                    if (email_already_exist) {
                        res.status(400).json({
                            Status: req.t('unsuccessfull_status'),
                            Response: req.t('email_already_exists_can_not_register_with_this_email')
                        });
                    } else {
                        body.password = await bcrypt.hash(body.password, await bcrypt.genSalt(7));

                        const otp = Math.floor(100000 + Math.random() * 900000);

                        const transporter = await nodemailer.createTransport({
                            service: "Gmail",
                            auth: {
                                user: process.env.APP_EMAIL,
                                pass: process.env.APP_PASSWORD
                            }
                        });

                        const mailOptions = {
                            from: process.env.APP_EMAIL,
                            to: body.email,
                            subject: req.t('otp_email_subject'),
                            text: req.t('hello') + body.username + req.t('text_for_email_registration') + otp
                        };

                        await transporter.sendMail(mailOptions);

                        const saved = await body.save();

                        await user.updateOne(
                            { email: body.email },
                            { $set: { otp: otp } }
                        );

                        const otp_for_debugging = await user.findOne({ email: body.email });

                        res.status(201).json({
                            Status: req.t('successfull_status'),
                            Response: req.t('otp_generation_on_recomended_email'),
                            Data: saved,
                            OTP: otp_for_debugging.otp

                        });
                    }
                }
            }
        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}



exports.resend_otp_for_email_registration = async (req, res, next) => {
    try {
        const id = req.params._id;

        const find_user = await user.findOne(
            { _id: id }
        );
        if (!find_user) {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id')
            });
        } else {
            const new_otp = Math.floor(100000 + Math.random() * 900000);

            const new_transporter = await nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.APP_EMAIL,
                    pass: process.env.APP_PASSWORD
                }
            });

            const new_mailOptions = {
                from: process.env.APP_EMAIL,
                to: find_user.email,
                subject: req.t('resend_otp_generation_subject'),
                text: req.t('hello') + find_user.username + req.t('text_for_email_registration_resend') + new_otp
            }

            await new_transporter.sendMail(new_mailOptions);

            await user.updateOne(
                { _id: find_user._id },
                { $set: { otp: new_otp } }
            );

            res.status(200).json({
                Status: req.t('successfull_status'),
                Response: req.t('resend_otp_success')
            });
        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}



exports.verify_otp = async (req, res, next) => {
    try {

        const user_id = req.params._id;

        const verify_otp = req.body.otp;

        const find_user = await user.findOne({ _id: user_id });
        if (!find_user) {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id')
            });
        } else {
            if (find_user.is_blocked === false) {
                if (find_user.otp != verify_otp) {
                    res.status(400).json({
                        Status: req.t('unsuccessfull_status'),
                        Response: req.t('entered_invalid_otp')
                    });
                } else {
                    const token = await jwt.sign({ email: find_user.email, password: find_user.password }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '15d'
                    });

                    res.status(200).json({
                        Status: req.t('successfull_status'),
                        Response: req.t('otp_verified_successfully'),
                        Token: token
                    });
                }
            } else {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('blocked_user')
                });
            }

        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}


exports.user_login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const updated_fcm_token = req.body.fcm_token;
        

        const result = await user.findOne({ email: email });
        if (!result) {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('user_not_found')
            });
        } else {
            if (result.is_blocked) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('blocked_user')
                })
            } else {
                if (result.is_social === true) {
                    const social_token = await jwt.sign({ email: result.email, _id: result._id }, process.env.ACCESS_TOKEN_SECRET, {
                        expiresIn: '15d'
                    });

                    //fcm token updation
                    await user.updateOne(
                        { _id: result._id },
                        { $set: { fcm_token: updated_fcm_token } }
                    );

                    res.status(200).json({
                        Status: req.t('successfull_status'),
                        Response: req.t('login_successfully'),
                        Data: result,
                        Token: social_token
                    });

                } else {
                    bcrypt.compare(password, result.password, async (error, match) => {
                        if (error || !match) {
                            res.status(400).json({
                                Status: req.t('unsuccessfull_status'),
                                Response: req.t('invalid_credentials')
                            });
                        } else {
                            const token = await jwt.sign({ email: result.email, password: result.password }, process.env.ACCESS_TOKEN_SECRET, {
                                expiresIn: '15d'
                            });

                            //fcm token updation
                            await user.updateOne(
                                { _id: result._id },
                                { $set: { fcm_token: updated_fcm_token } }
                            );

                            res.status(200).json({
                                Status: req.t('successfull_status'),
                                Response: req.t('login_successfully'),
                                Data: result,
                                Token: token
                            });
                        }
                    });
                }
            }
        }
    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}


exports.forget_password = async (req, res, next) => {
    try {
        const email = req.body.email;

        const is_valid = isEmail(email);
        if (!is_valid) {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('entered_invalid_email')
            });
        } else {
            const find_email = await user.findOne({ email: email });
            if (!find_email) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('email_does_not_exist')
                });
            } else {
                if (find_email.is_blocked === true) {
                    res.status(400).json({
                        Status: req.t('unsuccessfull_status'),
                        Response: req.t('blocked_user')
                    });
                } else {

                    const otp = Math.floor(100000 + Math.random() * 900000);

                    await user.updateOne(
                        { email: find_email.email },
                        { $set: { otp: otp } }
                    );

                    const transporter = await nodemailer.createTransport({
                        service: "Gmail",
                        auth: {
                            user: process.env.APP_EMAIL,
                            pass: process.env.APP_PASSWORD
                        }
                    });

                    const mailOptions = {
                        from: process.env.APP_EMAIL,
                        to: find_email.email,
                        subject: req.t('otp_forget_password_email_subject'),
                        text: req.t('text_for_grab_otp_in_forget_password') + otp
                    }

                    await transporter.sendMail(mailOptions);

                    //have to delete this otp part from this API
                    const otp_for_debugging = await user.findOne({ email: email });

                    res.status(200).json({
                        Status: req.t('successfull_status'),
                        Response: req.t('otp_sent_forget_password'),
                        Data: find_email._id,
                        OTP: otp_for_debugging.otp
                    });
                }

            }
        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}



// exports.verify_otp_for_forget_password = async (req, res) => {
//     try {
//         const user_id = req.params._id;

//         const get_otp = req.body.otp;

//         const find_user = await user.findOne({ _id: user_id });
//         if (!find_user) {
//             res.status(400).json({
//                 Status: req.t('unsuccessfull_status'),
//                 Response: req.t('invalid_user_id')
//             });
//         } else {
//             if (find_user.is_blocked == true) {
//                 res.status(400).json({
//                     Status: req.t('unsuccessfull_status'),
//                     Response: req.t('blocked_user')
//                 });
//             } else {
//                 if (find_user.otp != get_otp) {
//                     res.status(400).json({
//                         Status: req.t('unsuccessfull_status'),
//                         Response: req.t('entered_invalid_otp')
//                     });
//                 } else {
//                     res.status(200).json({
//                         Status: req.t('successfull_status'),
//                         Response: req.t('otp_verify_forget_password')
//                     });
//                 }
//             }
//         }

//     } catch (error) {
//         res.status(400).json({
//             Error_Message: error.message
//         });
//     }
// }



exports.change_password = async (req, res, next) => {
    try {

        const user_id = req.params._id;

        const body = req.body;

        const find_user = await user.findOne({ _id: user_id });
        if (!find_user) {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id')
            });
        } else {

            if (body.is_forget === "true") {

                console.log(body.is_forget);

                const hash_new_pass = await bcrypt.hash(body.newPassword, await bcrypt.genSalt(7));

                const update_pass = await user.updateOne(
                    { email: find_user.email },
                    { $set: { password: hash_new_pass } }
                );

                if (!update_pass) {
                    res.status(400).json({
                        Status: req.t('unsuccessfull_status'),
                        Response: req.t('something_went_wrong_at_password_updation')
                    });
                }

                res.status(201).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('password_changed_successfully')
                });


            } else {
                const pass_compare = await bcrypt.compare(body.oldPassword, find_user.password);
                if (!pass_compare) {
                    res.status(400).json({
                        Status: req.t('unsuccessfull_status'),
                        Response: req.t('incorrect_old_password')
                    });
                } else {
                    if (body.newPassword != body.confirmNewPassword) {
                        res.status(400).json({
                            Status: req.t('unsuccessfull_status'),
                            Response: req.t('new_pass_and_confirm_pass_does_not_match')
                        });

                    } else {
                        const hash_new_pass = await bcrypt.hash(body.newPassword, await bcrypt.genSalt(7));

                        const update_pass = await user.updateOne(
                            { email: find_user.email },
                            { $set: { password: hash_new_pass } }
                        );

                        if (!update_pass) {
                            res.status(400).json({
                                Status: req.t('unsuccessfull_status'),
                                Response: req.t('something_went_wrong_at_password_updation')
                            });
                        }

                        res.status(201).json({
                            Status: req.t('successfull_status'),
                            Response: req.t('password_changed_successfully')
                        });
                    }
                }

            }

        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}



exports.create_user_profile = async (req, res, next) => {
    try {
        const user_id = req.params._id;

        const body = new user(req.body);

        if (!req.file) {

            const find_user = await user.findOne({ _id: user_id });

            if (!find_user) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('invalid_user_id')
                });
            } else {
                const find_and_update = await user.updateOne(
                    { _id: user_id },
                    {
                        $set: {
                            username: body.username,
                            mobile_number: body.mobile_number,
                            age: body.age,
                            gender: body.gender,
                            address: body.address,
                            dob: body.dob,
                            intrested_category: body.intrested_category
                        }
                    }
                );

                // console.log(find_and_update);

                res.status(201).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('user_profile_created_successfully')
                });
            }

        } else {

            body.profile_picture = ("images/" + req.file.filename);

            const find_user = await user.findOne({ _id: user_id });

            if (!find_user) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('invalid_user_id')
                });
            } else {
                const find_and_update = await user.updateOne(
                    { _id: user_id },
                    {
                        $set: {
                            username: body.username,
                            mobile_number: body.mobile_number,
                            age: body.age,
                            gender: body.gender,
                            address: body.address,
                            dob: body.dob,
                            intrested_category: body.intrested_category,
                            profile_picture: body.profile_picture
                        }
                    }
                );

                const find_user_for_pic = await user.findOne({ _id: user_id });

                res.status(201).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('user_profile_created_successfully'),
                    Data: find_user_for_pic.profile_picture
                });
            }
        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}



exports.user_profile_info = async (req, res, next) => {
    try {
        const param_id = req.params._id;

        const find_user = await user.findOne({ _id: param_id });

        if (find_user) {

            res.status(200).json({
                Status: req.t('successfull_status'),
                Response: req.t('get_profile_info'),
                Data: find_user
            });
        } else {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id_in_params')
            })
        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        })
    }
}


exports.user_self_created_events = async (req, res, next) => {
    try {
        const param_id = req.params._id;

        const find_user = await user.findOne({ _id: param_id });

        if (find_user) {
            const with_events = await user.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(param_id)
                    }

                },

                {
                    $lookup: {
                        from: 'events',
                        localField: '_id',
                        foreignField: 'user_id',
                        as: 'Self_Created_Events'
                    }
                },
                {
                    $sort: {
                        'Self_Created_Events.created_at': -1
                    }
                }
                // {
                //     $addFields:{
                //         'Self_Created_Events':{
                //             $arrayElemAt:[{
                //                 $filter:{
                //                     input: '$Self_Created_Events',
                //                     as : 'sce',
                //                     cond:{
                //                         $eq : ['$$sce.user_id','param_id']
                //                     }
                //                 }
                //             },0]
                //         }
                //     }
                // }
                // {
                //     $match: { 'Self_Created_Events.user_id': find_user._id }
                // }
            ]);

            //    const result = with_events.filter(data=>{
            //        return data._id == param_id
            //     })


            // console.log(with_events.find({_id:param_id}))


            // const only_profile = await user.aggregate([
            //     {
            //         $lookup:{
            //             from: 'events',
            //             localField: '_id',
            //             foreignField: 'user_id',
            //             as: 'Self_Created_Events'
            //         }
            //     },
            //     {
            //         $match:{
            //             _id:param_id
            //         }
            //     }
            // ])
            // if (with_events == "") {
            //     res.status(200).json({
            //         Status: req.t('successfull_status'),
            //         Response: req.t('user_profile_given_below'),
            //         Data: find_user
            //     });
            // }else{
            res.status(200).json({
                Status: req.t('successfull_status'),
                Response: req.t('user_profile_along_with_self_events'),
                Data: with_events
            });
            // }
        } else {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id_in_params')
            })
        }
    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}


exports.user_saved_categories = async (req, res, next) => {
    try {
        const param_id = req.params._id;

        const body = {
            user_id: req.body.user_id,
            gender_saved: req.body.gender,
            age_range_saved: req.body.age_range,
            time_range_saved: req.body.time_range,
            location_category_saved: req.body.location_category
        }

        const find_user = await user.findOne({ _id: param_id });

        if (find_user) {


            const find_for_update = await savedcategories.findOne({ user_id: find_user._id });

            if (find_for_update) {
                const updation = await savedcategories.updateOne(
                    { user_id: find_for_update.user_id },
                    {
                        $set: {
                            gender_saved: body.gender_saved,
                            age_range_saved: body.age_range_saved,
                            time_range_saved: body.time_range_saved,
                            location_category_saved: body.location_category_saved
                        }
                    }
                );

                const find_updated_data = await savedcategories.findOne({ user_id: find_for_update.user_id });

                res.status(200).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('saved_category_updated_successfully'),
                    Data: find_updated_data
                });
            } else {
                body.user_id = find_user._id;
                // console.log(body.user_id);
                const saved = await savedcategories.create(body);

                res.status(201).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('categories_saved_successfully'),
                    Data: saved
                });
            }

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



exports.get_all_saved_categories = async (req, res, next) => {
    try {
        const param_id = req.params._id;

        const find_user = await user.findOne({ _id: param_id });

        if (find_user) {

            const find_saved_category = await savedcategories.findOne({ user_id: param_id });

            if (find_saved_category) {
                res.status(200).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('get_SavedCategories'),
                    Data: find_saved_category
                });
            } else {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('user_does_not_saved_any_categories')
                });
            }
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