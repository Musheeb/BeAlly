const multer = require('multer');
const path = require('path')

 const upload = multer({
    storage: multer.diskStorage(
        {
            destination: function (req, file, cb) {
                cb(null, "./public/images/")
            },

          
            filename: function (req, file, cb) {
              const  fpath = file.fieldname + "-" + Date.now()+ path.extname(file.originalname)
                cb(null,fpath )
            }
        }
    )
})
module.exports = upload;