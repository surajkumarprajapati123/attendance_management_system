const multer = require("multer");
const path = require("path");
// const address = require("../public/images")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationDir = path.join(__dirname, ".././public/images");
    console.log("destinationDir", destinationDir);
    cb(null, destinationDir);
  },

  filename: function (req, file, cb) {
    const unisuffix = Date.now();
    cb(null, file.originalname + "-" + unisuffix);
  },
});

const upload = multer({ storage: storage });
// console.log("upload is ", upload);
module.exports = upload;
