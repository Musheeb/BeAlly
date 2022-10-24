require('./config/config');
require('dotenv').config();

const express = require('express')
const admin_router = require('./routes/admin_routes/admin_routs')
const user_router = require('./routes/mobile_routes/user');
const event_router = require('./routes/mobile_routes/event');
const category_router = require('./routes/mobile_routes/category');
const messages_router = require('./routes/mobile_routes/messages');
const stripe_router = require('./routes/mobile_routes/stripe');
const setting_router = require('./routes/mobile_routes/setting');

const bodyParser = require('body-parser');

const morgan = require('morgan')
const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const middleware = require('i18next-http-middleware')
const cors = require('cors')

i18next.use(Backend).use(middleware.LanguageDetector)
.init({
    fallbackLng: 'en',
    backend:{
        loadPath:'./locales/{{lng}}/translation.json'
    }
})

const app = express();
// app.use((req, res, next) => {
//     if (req.originalUrl === '/admin/webhooks'|| req.originalUrl ==='/stripe/webhook')
//      {
//       next(); // Do nothing with the body because I need it in a raw state.
//     } else {
//         // console.log(req.originalUrl)
//       express.json()(req, res, next);  // ONLY do express.json() if the received request is NOT a WebHook from Stripe.
//     }});
app.use(bodyParser.json({
    verify: function (req, res, buf) {
      var url = req.originalUrl;
      if (url.startsWith('/admin/webhooks') || url.startsWith('/stripe/webhook')) {
         req.rawBody = buf.toString();
      }
    }
  }));


app.use(cors({ 
    origin: "*" 
}));

//Middlewares
app.use(express.static("./public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(middleware.handle(i18next));
app.use(morgan('dev'));
// admin routes
app.use('/admin',admin_router);
//mobile routes
app.use('/user', user_router);
app.use('/event', event_router);
app.use('/category', category_router);
app.use('/messages',messages_router);
app.use('/stripe',stripe_router);
app.use('/setting',setting_router);

// routes Error Handle
app.use((req,res,next)=>{
    const error = new Error(req.t('Invalid_Rout'))
    error.status = 404;
    next(error)
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
        messege:error.message 
    }
    });
});
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
 });


const PORT = process.env.MY_PORT;
app.listen(PORT,()=>{
    console.log(`Server up and running on port ${PORT}`)
});