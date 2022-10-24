const mongoose = require('mongoose');
const FCM = require('fcm-node');
var serverKey = process.env.FCM_SERVER_KEY;

// const user = require('../../models/user');
// const ovomessages = require('../../models/OVOmessages');
const allmessages = require('../../models/allMessages');
const user = require('../../models/user');
const inAppNotification = require('../../models/inAppNot');


exports.sendMessage = async(req, res, next)=>{
    try{
        const fcm = new FCM(serverKey);

        const param_id = req.params._id;

        const body = {
            conversation_id : req.body.conversation_id,
            sender_id : mongoose.Types.ObjectId(req.body.sender_id),
            receiver_id : mongoose.Types.ObjectId(req.body.receiver_id),
            message : req.body.message, 
            photo_url : req.body.photo_url,
            message_type : req.body.message_type,
            seen : req.body.seen
        }

        // console.log(body.conversation_id);
        // console.log(body.receiver_id)

        const find_legitimate_user = await user.findOne({_id:mongoose.Types.ObjectId(param_id)});

        if(find_legitimate_user){

            const find_receiver_user = await user.findOne({_id:body.receiver_id});

            // console.log(find_receiver_user);

            // console.log(!find_receiver_user.fcm_token);

            if(!find_receiver_user.fcm_token){
                if(body.message_type == "1" || !req.file || req.file == ""){
                    body.sender_id = mongoose.Types.ObjectId(param_id);
                    const save_message = await allmessages.create(body);
                    res.status(201).json({
                        Status:req.t('successfull_status'),
                        Response: req.t('message_sent_successfully'),
                        Data:save_message,
                        conversation_Id: body.conversation_id
                    });
                }else if(body.message_type == "2"){
                    body.sender_id = mongoose.Types.ObjectId(param_id);
                    body.photo_url = ('images/' + req.file.filename);
                    const save_message = await allmessages.create(body);
                    res.status(201).json({
                        Status:req.t('successfull_status'),
                        Response: req.t('message_sent_successfully'),
                        Data:save_message,
                        conversation_Id: body.conversation_id
                    });
                }

            }else{
                // console.log(body.sender_id);
                // console.log(body.conversation_id);
                // console.log(find_legitimate_user.username);
                let message = {
                    to:find_receiver_user.fcm_token,
                    notification:{
                        title:find_legitimate_user.username,
                        body:body.message,
                    },
                    data:{
                        conversation_id:body.conversation_id,
                        notType:1,
                        sender_name:find_legitimate_user.username,
                        sender_pic:find_legitimate_user.profile_picture,
                        sender_id:find_legitimate_user._id
                    }
                };

                fcm.send(message,async(error,result)=>{
                    if(error || !result){
                        if(body.message_type == "1" || !req.file || req.file == ""){
                            body.sender_id = mongoose.Types.ObjectId(param_id);
                            const save_message = await allmessages.create(body);
                            if(!save_message){
                                res.status(400).json({
                                    Status:req.t('unsuccessfull_status'),
                                    Response: req.t('message_has_not_sent_successfully')
                                });
                            }else{
                                res.status(201).json({
                                    Status:req.t('successfull_status'),
                                    Response: req.t('message_sent_successfully'),
                                    Data:save_message,
                                    Payload : message,
                                });
                            }
                        }else if(body.message_type == "2"){
                            body.sender_id = mongoose.Types.ObjectId(param_id);
                            body.photo_url = ('images/' + req.file.filename);
                            const save_message = await allmessages.create(body);
                            if(!save_message){
                                res.status(400).json({
                                    Status:req.t('unsuccessfull_status'),
                                    Response: req.t('message_has_not_sent_successfully')
                                });
                            }else{
                                res.status(201).json({
                                    Status:req.t('successfull_status'),
                                    Response: req.t('message_sent_successfully'),
                                    Data:save_message,
                                    Payload : message,
                                });
                            }
                        }
                    }else{
                        if(body.message_type == "1" || !req.file || req.file == ""){
                            body.sender_id = mongoose.Types.ObjectId(param_id);
                            const save_message = await allmessages.create(body);
                            if(!save_message){
                                res.status(400).json({
                                    Status:req.t('unsuccessfull_status'),
                                    Response: req.t('message_has_not_sent_successfully')
                                });
                            }else{
                                res.status(201).json({
                                    Status:req.t('successfull_status'),
                                    Response: req.t('message_sent_successfully'),
                                    Data:save_message,
                                    Payload : message,
                                });
                            }
                        }else if(body.message_type == "2"){
                            body.sender_id = mongoose.Types.ObjectId(param_id);
                            body.photo_url = ('images/' + req.file.filename);
                            const save_message = await allmessages.create(body);
                            if(!save_message){
                                res.status(400).json({
                                    Status:req.t('unsuccessfull_status'),
                                    Response: req.t('message_has_not_sent_successfully')
                                });
                            }else{
                                res.status(201).json({
                                    Status:req.t('successfull_status'),
                                    Response: req.t('message_sent_successfully'),
                                    Data:save_message,
                                    Payload : message,
                                });
                            }
                        }
                    }
                });
                
            }

        }else{
            res.status(400).json({
                Status:req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id_in_params')
            });
        }

    } catch(error){
        res.status(400).json({
            Error_Message:error.message
        });
    }
}




exports.getAllChats = async(req,res,next)=>{
    try{

        const page = req.body.page * 1 || 1;
        const limit = req.body.limit * 1 || 1;
        const skip = (page - 1) * limit;
        
        const param_id = mongoose.Types.ObjectId(req.params._id);

        const body = {
            conversation_id : req.body.conversation_id,
            sender_id : req.body.sender_id,
            receiver_id : req.body.receiver_id,
        }

        const find_legitimate_user = await user.findOne({_id:param_id});

        if(find_legitimate_user){
            const get_all_messages = await allmessages.aggregate([
                {
                    $match:{conversation_id:body.conversation_id}
                },
                {
                    $sort:{createdAt:-1}
                },
                {
                    $facet:{
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
            ]);

            //if it throws error about objectId casting in postman. comment find_receiver variable and 
            //don't use that variable in response (Account_Deleted).
            const find_receiver = await user.findOne({_id:body.receiver_id});
        
    
            res.status(200).json({
                Status:req.t('successfull_status'),
                Response:get_all_messages,
                Account_Deleted: find_receiver.is_deleted
            });
        }else{
            res.status(400).json({
                Status:req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id_in_params')
            });
        }

    }catch(error){
        res.status(400).json({
            Error_Message : error.message
        });
    }
}



exports.getEverChatted = async(req,res,next)=>{
    try{

        const param_id = mongoose.Types.ObjectId(req.params._id);
        
        const find_sender_id = await user.findOne({_id:param_id});

        if(find_sender_id){

            const find_all_messages = await allmessages.find({sender_id:param_id})
            .distinct('receiver_id');

            const find_all_messages_in_against = await allmessages.find({receiver_id:param_id})
            .distinct('sender_id');

            const users = [];
            for(let x of find_all_messages){
                const find_individual = await user.findOne({_id:x})
                users.push(find_individual)
            }

            const users_against = [];
            for(let y of find_all_messages_in_against){
                const find_individual_against = await user.findOne({_id:y})
                users_against.push(find_individual_against)
            }

            
            // users.concat(users_against);
            // console.log(users);
            // console.log(users,users_against);

            res.status(200).json({
                Status: req.t('successfull_status'),
                Response: req.t('all_conversation_list_for_this_user'),
                Data:{
                    users,
                    users_against
                }
            });
        }else{
            res.status(400).json({
                Status:req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id_in_params')
            });
        }
        

    } catch(error){
        res.status(400).json({
            Error_Message : error.message
        })
    }
}



exports.get_in_app_notification = async(req,res,next)=>{
    try{

        const page = req.body.page * 1 || 1;
        const limit = req.body.limit * 1 || 20;
        const skip = (page - 1) * limit;

        const param_id = req.params._id;

        const find_user = await user.findOne({_id:param_id});

        if(find_user){

            const find_notifications = await inAppNotification.aggregate([
                {
                    $match:{notif_receiver_id:find_user._id}
                },
                {
                    $facet:{
                        MetaData: [
                            { $count: 'TotalRecords' },
                            { $addFields: { PageNo: page } }
                        ],
                        Data: [
                            { $sort:{'createdAt':-1}},
                            { $skip: skip },
                            { $limit: limit },
                        ]
                    }
                },

            ]);

            res.status(200).json({
                Status : req.t('successfull_status'),
                Response : req.t('in_app_notifications_given_below'),
                Data: find_notifications
            });
        }else{
            res.status(400).json({
                Status:req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id_in_params')
            });
        }
        
    } catch(error){
        res.status(400).json({
            Error_Message : error.message
        });
    }
}





// exports.OVOConnection = async (req, res, next) => {
//     try {

//         const page = req.body.page * 1 || 1;
//         const limit = req.body.limit * 1 || 1;
//         const skip = (page - 1) * limit;

//         const body = {
//             user_1_id: mongoose.Types.ObjectId(req.body.user_1_id),
//             user_1_name: mongoose.Types.ObjectId(req.body.user_1_name),
//             user_2_id: req.body.user_2_id,
//             user_2_name: req.body.user_2_name,
//             first_message: req.body.first_message,
//         }

//         const all_messages_body = {
//             chat_id : mongoose.Types.ObjectId(req.body.chat_id),
//             sender_id : mongoose.Types.ObjectId(req.body.sender_id),
//             receiver_id : mongoose.Types.ObjectId(req.body.receiver_id),
//             message : req.body.message,
//             message_type : req.body.message_type,
//             photo_url : req.body.photo_url,
//             seen : req.body.seen
//         }


//         const find_user_1_name = await user.findOne({ _id: body.user_1_id });
//         const find_user_2_name = await user.findOne({ _id: body.user_2_id });

//         if (!find_user_1_name || !find_user_2_name) {
//             res.status(400).json({
//                 Status: req.t('unsuccessfull_status'),
//                 Response: req.t('body_user_not_found')
//             });
//         }else{
//             if(body.user_1_id == req.params._id || body.user_2_id == req.params._id){
//                 const get_user_1_name = find_user_1_name.username;
//                 const get_user_2_name = find_user_2_name.username;

//                 const if_record_already_exists = await ovomessages.findOne({
//                     $or:[
//                         {user_1_id:body.user_1_id,user_2_id:body.user_2_id},
//                         {user_1_id:body.user_2_id,user_2_id:body.user_1_id}
//                     ]});

//                     // console.log(if_record_already_exists._id);
                
                

//                 if(if_record_already_exists){
//                     const all_record = await allmessages.find({chat_id:if_record_already_exists._id})
//                     .sort({created_at:1})
//                     .skip(skip)
//                     .limit(limit);

//                     res.status(200).json({
//                         Status:req.t('successfull_status'),
//                         Response:req.t('connection_between_these_two_already_created'),
//                         Total_Messages: all_record.length,
//                         Data: all_record
//                     });
//                 }else{

//                     body.user_1_name = get_user_1_name;
//                     body.user_2_name = get_user_2_name;

//                     if (body.first_message) {

//                         if(all_messages_body.message_type == 1 || !req.file || req.file == ""){
//                             all_messages_body.message = body.first_message;

//                             all_messages_body.sender_id = body.user_1_id;
//                             all_messages_body.receiver_id = body.user_2_id;


//                             const saved = await ovomessages.create(body);
//                             all_messages_body.chat_id = saved._id;
//                             const all_messages_saved = await allmessages.create(all_messages_body);

//                             res.status(200).json({
//                                 Status: req.t('successfull_status'),
//                                 Response: req.t('first_time_record_creation'),
//                                 Data: {
//                                     saved,
//                                     all_messages_saved
//                                 }
//                             });

//                         }else if(all_messages_body.message_type == 2 || req.file){

//                             body.first_message = ('images/' + req.file.filename);

//                             all_messages_body.sender_id = body.user_1_id;
//                             all_messages_body.receiver_id = body.user_2_id;

//                             all_messages_body.photo_url = body.first_message;
//                             const saved = await ovomessages.create(body);
//                             all_messages_body.chat_id = saved._id;
//                             const all_messages_saved = await allmessages.create(all_messages_body);

//                             res.status(200).json({
//                                 Status: req.t('successfull_status'),
//                                 Response: req.t('first_time_record_creation'),
//                                 Data: {
//                                     saved,
//                                     all_messages_saved
//                                 }
//                             });
//                         }

//                     } else {
//                         res.status(200).json({
//                             Status: req.t('successfull_status'),
//                             Response: "Nothing has happened not even data has been saved because you haven't passed first_message in body."
//                         });
//                     }
//                 }

//             }else{
//                 res.status(400).json({
//                     Status: req.t('unsuccessfull_status'),
//                     Response: req.t('params_id_and_body_id_does_not_match')
//                 });
//             }
//         }



//         // if (body.user_1_id == req.params._id || body.user_2_id == req.params._id) {
            
//         //     if (!find_user_1_name || !find_user_2_name) {
//         //         res.status(400).json({
//         //             Status: req.t('unsuccessfull_status'),
//         //             Response: req.t('body_user_not_found')
//         //         });
//         //     } else {
//         //         const get_user_1_name = find_user_1_name.username;
//         //         const get_user_2_name = find_user_2_name.username;

//         //         body.user_1_name = get_user_1_name;
//         //         body.user_2_name = get_user_2_name;

//         //         if (body.first_message) {
//         //             const saved = await ovomessages.create(body);

//         //             res.status(200).json({
//         //                 Status: req.t('successfull_status'),
//         //                 Response: "This message route is working",
//         //                 Data: saved
//         //             });

//         //         } else {
//         //             res.status(200).json({
//         //                 Status: req.t('successfull_status'),
//         //                 Response: "Nothing has happened not even data has been saved."
//         //             });
//         //         }
//         //     }

//         // } else {
//         //     res.status(400).json({
//         //         Status: req.t('unsuccessfull_status'),
//         //         Response: req.t('params_id_and_body_id_does_not_match')
//         //     });
//         // }

//     } catch (error) {
//         res.status(400).json({
//             Error_Message: error.message
//         });
//     }
// }


// exports.chat = async (req, res, next) => {
//     try {
//         const body = {
//             chat_id : req.body.chat_id,
//             sender_id : req.body.sender_id,
//             receiver_id : req.body.receiver_id,
//             message : req.body.message,
//             message_type : req.body.message_type,
//             photo_url : req.body.photo_url,
//             seen : req.body.seen
//         }

//         const find_chat_id = await ovomessages.findOne({_id:body.chat_id});

//         if(!find_chat_id){
//             res.status(400).json({
//                 Status:req.t('unsuccessfull_status'),
//                 Response:req.t('record_not_found_in_database')
//             });
//         }else{
//             if(req.params._id == find_chat_id.user_1_id){

//                 body.sender_id = find_chat_id.user_1_id;
//                 body.receiver_id = find_chat_id.user_2_id;

//                 if(body.message_type == 2){
//                     body.photo_url = ('images/' + req.file.filename);
//                     const save_message = await allmessages.create(body);
//                     res.status(201).json({
//                         Status:req.t('successfull_status'),
//                         Response: req.t('message_saved_successfully'),
//                         Data:save_message
//                     });
//                 }else if(body.message_type == 1 || !req.file || req.file == ""){
//                     const save_message = await allmessages.create(body);
//                     res.status(201).json({
//                         Status:req.t('successfull_status'),
//                         Response: req.t('message_saved_successfully'),
//                         Data:save_message
//                     });
//                 }
//                 // res.send("matched with user 1");

//             }else if(req.params._id == find_chat_id.user_2_id){

//                 body.sender_id = find_chat_id.user_2_id;
//                 body.receiver_id = find_chat_id.user_1_id;

//                 if(body.message_type == 2){
//                     body.photo_url = ('images/' + req.file.filename);
//                     const save_message = await allmessages.create(body);
//                     res.status(201).json({
//                         Status:req.t('successfull_status'),
//                         Response: req.t('message_saved_successfully'),
//                         Data:save_message
//                     });
//                 }else if(body.message_type == 1 || !req.file || req.file == ""){
//                     const save_message = await allmessages.create(body);
//                     res.status(201).json({
//                         Status:req.t('successfull_status'),
//                         Response: req.t('message_saved_successfully'),
//                         Data:save_message
//                     });
//                 }

//                 // res.send("matched with user 2")

//             }else{
//                 res.status(201).json({
//                     Status: req.t('successfull_status'),
//                     Response: "something went wrong when matching with id."
//                 });
//             }  
//         }
        
//     } catch (error) {
//         res.status(400).json({
//             Error_Message: error.message
//         });
//     }
// }