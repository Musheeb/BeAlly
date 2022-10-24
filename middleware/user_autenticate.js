const jwt = require('jsonwebtoken');

module.exports = async function verify_token(req,res,next){
    // const header = req.header['authorization'];
    // console.log(header);

    const header = req.get('authorization');
    // console.log(headerr)

    if(!header){
        res.status(401).json({
            Status: req.t('unsuccessfull_status'),
            Response: req.t('token_not_found')
        });
    }else{
        const token = header.split(' ')[1];
        if(token==null){
            res.status(400).json({
                Status: req.t('unsuccessfull_status'),
                Response: req.t('something_went_wrong')
            });
        }else{
            // console.log(token)
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(error,result)=>{
                if(error|| !result){
                    res.status(400).json({
                        Status: req.t('unsuccessfull_status'),
                        Response: req.t('token_has_not_verified_successfully')
                    });
                }else{
                     req.new_email = result.email;
                     req.new_password = result.password;
                    // console.log(result.email);
                    // console.log(result.password);
                    next();
                }
            });
            // if(!token_verify){        
            // }
        }
    }
}

// exports.func1 = async function func1(req,res,next){
    
//     // console.log("This is function 1 in middleware 1.");

//     req.random_variable = "this is string for random variable"; 

//     req.element = [12,13,14,15];

//     req.string_to_split = "partToSplit THisispart2";

//     console.log( req.random_variable);

//     next();
// }

// exports.func2 = async function func2(req,res,next){

//     // const new_random = req.random_variable;
//     console.log("This is function 2 in middleware 2");


//     const new_var = req.string_to_split.split(' ')[1];

//     console.log(new_var);

//     // console.log(req.element);



//     // const new_variable = req.random_variable;

//     // console.log("accessing the value of middleware 1 in this log " +    req.random_variable);
    
//     next();

// }