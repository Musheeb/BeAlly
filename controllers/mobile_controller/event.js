const mongoose = require('mongoose');

const FCM = require('fcm-node');
var serverKey = process.env.FCM_SERVER_KEY;


const event = require('../../models/event');
const category = require('../../models/event_category');
const user = require('../../models/user');
const report_event = require('../../models/reportEvent');
const savedcategories = require('../../models/userSavedCat');
const inAppNotification = require('../../models/inAppNot');


exports.create_event = async (req, res, next) => {
    try {
        if (!req.file) {
            const body = {
                name: req.body.name,
                start_date_and_time: req.body.start_date_and_time,
                end_date_and_time: req.body.end_date_and_time,
                age_limit: req.body.age_limit,
                gender_specification: req.body.gender_specification,
                venue: req.body.venue,
                description: req.body.description,
                category_id: req.body.category_id,
                user_id: req.params._id
            }

            if (!body.name || !body.start_date_and_time || !body.end_date_and_time ||
                !body.venue || !body.category_id) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('fields_can_not_be_null')
                });
            } else {

                const created = await event.create(body);

                const fcm = new FCM(serverKey);

                const notification_body = {
                    event_id: req.body.event_id,
                    user_id: req.body.user_id,
                    notif_receiver_id : req.body.notif_receiver_id,
                    event_conductor_name: req.body.event_conductor_name,
                    event_conductor_pic: req.body.event_conductor_pic,
                    matched_category: req.body.matched_category,
                    notification_title: req.body.notification_title,
                    notification_body: req.body.notification_body,
                    seen: req.body.seen
                }

                const find_event_creator_name = await user.findOne({ _id: body.user_id });

            
            //********************************for gender saved categories.**********************************//    
                const find_gender = await savedcategories.find({ gender_saved: body.gender_specification });
                for(let value of find_gender){

                    notification_body.event_id = created._id;
                    notification_body.user_id = find_event_creator_name._id;
                    notification_body.notif_receiver_id = value.user_id;
                    notification_body.event_conductor_name = find_event_creator_name.username;
                    notification_body.event_conductor_pic = find_event_creator_name.profile_picture;
                    notification_body.matched_category = value.gender_saved;

                    const find_user_fcm = await user.findOne({ _id: notification_body.user_id });

                    let creator_name = find_event_creator_name.username;

                    let message = {
                        to: find_user_fcm.fcm_token,
                        notification: {
                            title: created.name,
                            body: creator_name + ' has created event that matches one of your saved categories.',
                        }
                    };

                    notification_body.notification_title = message.notification.title;
                    notification_body.notification_body = message.notification.body;

                    await inAppNotification.create(notification_body);

                    fcm.send(message, (err, result) => {
                        if (err || !result) {
                            return
                        } else {
                            return
                        }
                    });

                }


            //********************************for Age saved categories.**********************************//

            const find_age = await savedcategories.find({ age_range_saved: body.age_limit});
            
            for(let value of find_age){
                
                notification_body.event_id = created._id;
                notification_body.user_id = find_event_creator_name._id;
                notification_body.notif_receiver_id = value.user_id;
                notification_body.event_conductor_name = find_event_creator_name.username;
                notification_body.event_conductor_pic = find_event_creator_name.profile_picture;
                notification_body.matched_category = value.age_range_saved;

                const find_user_fcm = await user.findOne({ _id: notification_body.user_id });

                let creator_name = find_event_creator_name.username;

                let message = {
                    to: find_user_fcm.fcm_token,
                    notification: {
                        title: created.name,
                        body: creator_name + ' has created event that matches one of your saved categories.',
                    }
                };

                notification_body.notification_title = message.notification.title;
                notification_body.notification_body = message.notification.body;

                await inAppNotification.create(notification_body);

                fcm.send(message, (err, result) => {
                    if (err || !result) {
                        return
                    } else {
                        return
                    }
                });

            }


                //********************************for time range saved categories.**********************************//
                const time_range = await savedcategories.find({ time_range_saved: body.start_date_and_time});
                for (let value of time_range){

                    notification_body.event_id = created._id;
                    notification_body.user_id = find_event_creator_name._id;
                    notification_body.notif_receiver_id = value.user_id;
                    notification_body.event_conductor_name = find_event_creator_name.username;
                    notification_body.event_conductor_pic = find_event_creator_name.profile_picture;
                    notification_body.matched_category = value.time_range_saved;

                    const find_user_fcm = await user.findOne({ _id: notification_body.user_id });

                    let creator_name = find_event_creator_name.username;

                    let message = {
                        to: find_user_fcm.fcm_token,
                        notification: {
                            title: created.name,
                            body: creator_name + ' has created event that matches one of your saved categories.',
                        }
                    };

                    notification_body.notification_title = message.notification.title;
                    notification_body.notification_body = message.notification.body;

                    await inAppNotification.create(notification_body);

                    fcm.send(message, (err, result) => {
                        if (err || !result) {
                            return
                        } else {
                            return
                        }
                    });
                }

                //********************************for saved Event categories.**********************************//
                const find_event_name = await category.findOne({_id:body.category_id});
                const category_name = find_event_name.name;

                const saved_location_cat = await savedcategories.find({location_category_saved:category_name});

                for (let value of saved_location_cat){

                    notification_body.event_id = created._id;
                    notification_body.user_id = find_event_creator_name._id;
                    notification_body.notif_receiver_id = value.user_id;
                    notification_body.event_conductor_name = find_event_creator_name.username;
                    notification_body.event_conductor_pic = find_event_creator_name.profile_picture;
                    notification_body.matched_category = category_name;

                    const find_user_fcm = await user.findOne({ _id: notification_body.user_id });

                    let creator_name = find_event_creator_name.username;

                    let message = {
                        to: find_user_fcm.fcm_token,
                        notification: {
                            title: created.name,
                            body: creator_name + ' has created event that matches one of your saved categories.',
                        }
                    };

                    notification_body.notification_title = message.notification.title;
                    notification_body.notification_body = message.notification.body;

                    await inAppNotification.create(notification_body);

                    fcm.send(message, (err, result) => {
                        if (err || !result) {
                            return
                        } else {
                            return
                        }
                    });

                }


                res.status(201).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('event_created_successfully'),
                    Data: created,
                    Note: "Given below objects(gender,age and time) are only for testing purpose do not pay attention there if you are here just to create event.",
                    gender: find_gender,
                    age: find_age,
                    time: time_range,
                    event_categories: saved_location_cat

                });

            }

        } else {
            const body = {
                name: req.body.name,
                picture: req.body.picture,
                start_date_and_time: req.body.start_date_and_time,
                end_date_and_time: req.body.end_date_and_time,
                age_limit: req.body.age_limit,
                gender_specification: req.body.gender_specification,
                venue: req.body.venue,
                description: req.body.description,
                category_id: req.body.category_id,
                user_id: req.params._id
            }

            if (!body.name || !body.start_date_and_time || !body.end_date_and_time ||
                !body.venue || !body.category_id) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('fields_can_not_be_null')
                });
            } else {
                body.picture = ("images/" + req.file.filename);

                const find_image = await category.findOne({ _id: body.category_id });
                body.category_picture = find_image.picture;

                const created = await event.create(body);

                const fcm = new FCM(serverKey);

                const notification_body = {
                    event_id: req.body.event_id,
                    user_id: req.body.user_id,
                    notif_receiver_id : req.body.notif_receiver_id,
                    event_conductor_name: req.body.event_conductor_name,
                    event_conductor_pic: req.body.event_conductor_pic,
                    matched_category: req.body.matched_category,
                    notification_title: req.body.notification_title,
                    notification_body: req.body.notification_body,
                    seen: req.body.seen
                }

                const find_event_creator_name = await user.findOne({ _id: body.user_id });

            
                //********************************for gender saved categories.**********************************//    
                const find_gender = await savedcategories.find({ gender_saved: body.gender_specification });
                for(let value of find_gender){

                    notification_body.event_id = created._id;
                    notification_body.user_id = find_event_creator_name._id;
                    notification_body.notif_receiver_id = value.user_id;
                    notification_body.event_conductor_name = find_event_creator_name.username;
                    notification_body.event_conductor_pic = find_event_creator_name.profile_picture;
                    notification_body.matched_category = value.gender_saved;

                    const find_user_fcm = await user.findOne({ _id: notification_body.user_id });

                    let creator_name = find_event_creator_name.username;

                    let message = {
                        to: find_user_fcm.fcm_token,
                        notification: {
                            title: created.name,
                            body: creator_name + ' has created event that matches one of your saved categories.',
                        }
                    };

                    notification_body.notification_title = message.notification.title;
                    notification_body.notification_body = message.notification.body;

                    await inAppNotification.create(notification_body);

                    fcm.send(message, (err, result) => {
                        if (err || !result) {
                            return
                        } else {
                            return
                        }
                    });

                }


                //********************************for Age saved categories.**********************************//

                const find_age = await savedcategories.find({ age_range_saved: body.age_limit});
                
                for(let value of find_age){
                    
                    notification_body.event_id = created._id;
                    notification_body.user_id = find_event_creator_name._id;
                    notification_body.notif_receiver_id = value.user_id;
                    notification_body.event_conductor_name = find_event_creator_name.username;
                    notification_body.event_conductor_pic = find_event_creator_name.profile_picture;
                    notification_body.matched_category = value.age_range_saved;

                    const find_user_fcm = await user.findOne({ _id: notification_body.user_id });

                    let creator_name = find_event_creator_name.username;

                    let message = {
                        to: find_user_fcm.fcm_token,
                        notification: {
                            title: created.name,
                            body: creator_name + ' has created event that matches one of your saved categories.',
                        }
                    };

                    notification_body.notification_title = message.notification.title;
                    notification_body.notification_body = message.notification.body;

                    await inAppNotification.create(notification_body);

                    fcm.send(message, (err, result) => {
                        if (err || !result) {
                            return
                        } else {
                            return
                        }
                    });

                }


                //********************************for time range saved categories.**********************************//
                const time_range = await savedcategories.find({ time_range_saved: body.start_date_and_time});
                for (let value of time_range){

                    notification_body.event_id = created._id;
                    notification_body.user_id = find_event_creator_name._id;
                    notification_body.notif_receiver_id = value.user_id;
                    notification_body.event_conductor_name = find_event_creator_name.username;
                    notification_body.event_conductor_pic = find_event_creator_name.profile_picture;
                    notification_body.matched_category = value.time_range_saved;

                    const find_user_fcm = await user.findOne({ _id: notification_body.user_id });

                    let creator_name = find_event_creator_name.username;

                    let message = {
                        to: find_user_fcm.fcm_token,
                        notification: {
                            title: created.name,
                            body: creator_name + ' has created event that matches one of your saved categories.',
                        }
                    };

                    notification_body.notification_title = message.notification.title;
                    notification_body.notification_body = message.notification.body;

                    await inAppNotification.create(notification_body);

                    fcm.send(message, (err, result) => {
                        if (err || !result) {
                            return
                        } else {
                            return
                        }
                    });
                }

                //********************************for saved Event categories.**********************************//
                const find_event_name = await category.findOne({_id:body.category_id});
                const category_name = find_event_name.name;

                const saved_location_cat = await savedcategories.find({location_category_saved:category_name});

                for (let value of saved_location_cat){

                    notification_body.event_id = created._id;
                    notification_body.user_id = find_event_creator_name._id;
                    notification_body.notif_receiver_id = value.user_id;
                    notification_body.event_conductor_name = find_event_creator_name.username;
                    notification_body.event_conductor_pic = find_event_creator_name.profile_picture;
                    notification_body.matched_category = category_name;

                    const find_user_fcm = await user.findOne({ _id: notification_body.user_id });

                    let creator_name = find_event_creator_name.username;

                    let message = {
                        to: find_user_fcm.fcm_token,
                        notification: {
                            title: created.name,
                            body: creator_name + ' has created event that matches one of your saved categories.',
                        }
                    };

                    notification_body.notification_title = message.notification.title;
                    notification_body.notification_body = message.notification.body;

                    await inAppNotification.create(notification_body);

                    fcm.send(message, (err, result) => {
                        if (err || !result) {
                            return
                        } else {
                            return
                        }
                    });

                }

                //this block of response is gonna run because it is out of loops and this code holds the 
                //response in postman.(Don't touch it)
                res.status(201).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('event_created_successfully'),
                    Data: created,
                    Note: "Given below objects(gender,age and time) are only for testing purpose do not pay attention there if you are here just to create event.",
                    gender: find_gender,
                    age: find_age,
                    time: time_range,
                    event_categories: saved_location_cat

                });

            }
        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}



exports.events_user_feed_filter = async (req, res, next) => {
    try {
        const page = req.body.page * 1 || 1;
        const limit = req.body.limit * 1 || 1;
        const skip = (page - 1) * limit;

        const location_category = req.body.location_category;

        const filter_gender = req.body.gender;
        const filter_age_range = req.body.age_range;
        const filter_by_time_st_time = req.body.start_time;
        const filter_by_time_end_time = req.body.end_time;


        let query = [];

        let lookup = {
            $lookup: {
                from: 'events',
                localField: '_id',
                foreignField: 'user_id',
                as: 'Event_Details'
            }
        };

        query.push(lookup);



        const unwind = {
            $unwind: '$Event_Details'
        }
        query.push(unwind);



        const sort = {
            $sort: {
                'Event_Details.created_at': -1
            }
        }
        query.push(sort)



        if (location_category != null) {
            const match_location_cat = {
                $match: {
                    'Event_Details.category_id': mongoose.Types.ObjectId(location_category)
                }
            }
            query.push(match_location_cat);
        }
        if (filter_gender != null) {
            const is_filter_gender = {
                $match: {
                    'Event_Details.gender_specification': filter_gender
                }
            }
            query.push(is_filter_gender)
        }




        if (filter_age_range != null) {
            if (filter_age_range == 12) {
                const is_filter_age_range = {
                    $match: {
                        'Event_Details.age_limit': { $lte: parseInt(filter_age_range) }
                    }
                }
                query.push(is_filter_age_range)

            } else {
                const is_filter_age_range = {
                    $match: {
                        'Event_Details.age_limit': { $gte: parseInt(filter_age_range), $lte: 100 }
                    }
                }
                query.push(is_filter_age_range)
            }
        }




        if (filter_by_time_st_time != null || filter_by_time_end_time != null) {
            const is_filter_by_time = {
                $match: {
                    $and: [
                        { 'Event_Details.start_date_and_time': { $gte: new Date(filter_by_time_st_time) } },
                        { 'Event_Details.end_date_and_time': { $lte: new Date(filter_by_time_end_time) } },
                    ]

                }
            }
            query.push(is_filter_by_time)
        }



        const projection = {
            $project: {
                otp: 0,
                email: 0,
                password: 0,
                intrested_category: 0,
                is_subscribed: 0,
                is_social: 0,
                is_blocked: 0,
                created_at: 0,
                updated_at: 0,
                mobile_number: 0,
                dob: 0,
                address: 0,
                __v: 0
            }
        }
        query.push(projection)



        const count = {
            $facet: {
                MetaData: [
                    { $count: 'TotalRecords' },
                    { $addFields: { PageNo: page } }
                ],
                Data: [
                    { $skip: skip },
                    { $limit: limit }
                ]
            }
        }
        query.push(count);



        const result = await user.aggregate(query);

        res.status(200).json({
            Status: req.t('successfull_status'),
            Response: req.t('event_user_feed_filter'),
            Data: result
        });

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}



exports.report_event = async (req, res, next) => {
    try {
        const body = new report_event(req.body);

        const find_user = await user.findOne({ _id: body.user_id });

        if (!find_user) {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('user_not_found')
            });
        } else {
            const find_event = await event.findOne({ _id: body.event_id });
            if (!find_event) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('event_not_found')
                });
            } else {

                const saved = await body.save();

                res.status(200).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('report_event_successfully'),
                    Data: saved
                });
            }
        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}



exports.other_user_events_list = async (req, res, next) => {
    try {
        const param_id = req.params._id;

        const body = req.body;

        const find_user = await user.findOne({ _id: param_id });

        if (find_user) {
            const find_user_in_body = await user.findOne({ _id: body.user_id });

            if (find_user_in_body) {
                const find_events = await user.aggregate([
                    {
                        $lookup: {
                            from: 'events',
                            localField: '_id',
                            foreignField: 'user_id',
                            as: 'User_Events'
                        }
                    },
                    {
                        $match: {
                            'User_Events.user_id': find_user_in_body._id
                        }

                    }

                ]);
                res.status(200).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('user_all_events_given_below'),
                    Data: find_events
                });
            } else {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('body_user_not_found')
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
        })
    }
}

