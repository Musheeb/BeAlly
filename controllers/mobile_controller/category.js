const category = require('../../models/event_category');
const user = require('../../models/user');
const eventschema = require('../../models/event_category');

exports.get_all_categories = async (req, res, next) => {
    try {
        const user_id = req.params._id;

        const find_user = await user.findOne({ _id: user_id });

        if (!find_user) {
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('invalid_user_id')
            });
        } else {
            const get_all_category = await eventschema.find();

            if (!get_all_category) {
                res.status(400).json({
                    Status: req.t('unsuccessfull_status'),
                    Response: req.t('categories_not_found')
                });
            } else {
                res.status(200).json({
                    Status: req.t('successfull_status'),
                    Response: req.t('successfull_get_all_categories'),
                    Total_Categories: get_all_category.length,
                    Data: get_all_category
                });
            }
        }

    } catch (error) {
        res.status(400).json({
            Error_Message: error.message
        });
    }
}