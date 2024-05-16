const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const SendMailAnywhere = async (mail, data, subject) => {
  try {
    // const templatePath = path.join(__dirname, "../views/otp.ejs");
    // const data = await ejs.renderFile(templatePath, { otp, username });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      // secure: true, // use SSL
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL, // Specify the sender's email address here
      to: mail,
      subject: subject,
      html: data,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent successfully:`, info.response);
        // console.log(`Email sent successfully:`, info);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = SendMailAnywhere;
