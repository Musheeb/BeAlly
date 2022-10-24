const category = require('../models/event_category');
const user = require('../models/user');

module.exports = async function user_is_subscribed(req,res,next){
    try{
        const u_id = req.params._id;
        const found = await user.findOne({ _id: u_id });
        if (!found) {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('user_not_found')
            });
        }else{
            if (!found.is_subscribed) {
                const result = await category.findOne({ _id: req.body.category_id });
                if (!result) {
                    res.status(400).json({
                        Status: req.t('unsuccessfull_status'),
                        Response: req.t('category_not_found')
                    });
                }else {
                    if (result.name === 'Home') {
                        res.status(400).json({
                            Status: req.t('unsuccessfull_status'),
                            Response: req.t('unsubscribed_to_home')
                        });
                    }else{
                   
                        next();
                    }
                }
            }else{
                next();
            }
        }

    } catch(error){
        res.status(400).json({
            Error_Message : error.message
        })
    }
} 