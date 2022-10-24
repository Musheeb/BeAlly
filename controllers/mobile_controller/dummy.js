const user = require('../../models/user');

exports.dummy = async(req,res,next)=>{
    try{

        // const get_all = await user.findOne({_id:'632c3a1d3f1c067a1db1794d'});
        // // console.log(typeof(get_all));
        // const new_one = get_all.created_at;
        // // console.log(typeof(new_one));
        // let d;
        // // d = new_one.toISOString();
        // d = new_one.getTime();
        // // console.log(d);
        // const newvar = new Date(d);
        // console.log(newvar);

        // //this getHours() function gets local time when you convert any kind of time into this function.
        // const for_type = newvar.getHours();
        // console.log(typeof(for_type));

        // //these three are suitable to get time.
        // console.log(newvar.getUTCHours());
        // console.log(newvar.getUTCMinutes());
        // console.log(newvar.getUTCSeconds());
        // // console.log(typeof(d));



        res.status(201).json({
            Status : req.t('successfull_status'),
            Response: "User added successfully."
        });
    } catch(error){
        res.status(400).json({
            Error_Message : error.message
        });
    }
}