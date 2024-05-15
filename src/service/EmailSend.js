// const nodemailer = require("nodemailer");
// const ejs = require("ejs");
// const path = require("path");
// const { OtpModel } = require("../models");
// const otp = require("../models/otp.model");
// const dotenv = require("dotenv");
// dotenv.config();

// const SendMailWithTemplate = async (mail, otp, username) => {
//   try {
//     const templatePath = path.join(__dirname, "../views/otp.ejs");
//     const data = await ejs.renderFile(templatePath, { otp, username });

//     const transporter = nodemailer.createTransport({
//       host: "smtp.mailtrap.io",
//       port: 2525,
//       secure: false,
//       auth: {
//         user: process.env.USER,
//         pass: process.env.PASSWORD,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL, // Specify the sender's email address here
//       to: mail,
//       subject: "Email Verification",
//       html: data,
//     };
//     console.log("mail is ", mail);
//     await transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log(`Email sent successfully:`, info.response);
//         console.log(`Email sent successfully:`, info);
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// const GeneratorOtp = async (emaildata) => {
//   const character =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
//   let result = "";
//   const characterLength = character.length;
//   for (let i = 0; i < 6; i++) {
//     result += character.charAt(Math.floor(Math.random() * characterLength));
//   }
//   // const { email } = emaildata;
//   // console.log(emaildata);
//   // console.log("send mail is ", email);
//   const Otp = await OtpModel.create({
//     email: emaildata,
//     otp: result.toUpperCase(),
//   });
//   console.log(Otp);
//   return Otp;
// };

// // const SendOnlyEmailForgate = async (email, token) => {
// //   try {
// //     const resetPasswordLink = `
// //  http://localhost:5173/reset-password/${token}`;
// //     const templtepath = path.join(__dirname, "../views/Reset.ejs");
// //     const data = await ejs.renderFile(templtepath, { resetPasswordLink });

// //     const transporter = nodemailer.createTransport({
// //       host: "smtp.mailtrap.io",
// //       port: 2525,
// //       secure: false, // TLS requires secureConnection to be false
// //       auth: {
// //         user: process.env.EMAIL,
// //         pass: process.env.PASSWORD,
// //       },
// //     });
// //     const mailOptions = {
// //       from: process.env.EMAIL,
// //       to: email,
// //       subject: "Reset Password",
// //       html: data,
// //     };

// //     await transporter.sendMail(mailOptions, (error, info) => {
// //       if (error) {
// //         console.log(error);
// //       } else {
// //         console.log("Email sent successfully:", info.response);
// //       }
// //     });
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// // SendMailWithTemplate(
// //   "surajkumarprajapati632@gmail.com",
// //   1234561222,
// //   "newusername"
// // );

// // console.log(data);

// module.exports = {
//   SendMailWithTemplate,
//   GeneratorOtp,
//   // SendOnlyEmailForgate,
// };

// // GeneratorOtp("surajkumar@gmaml.com");
// // SendMailWithTemplate("surajsurajkumar@yopmail.com", "adsgfadf", "suraj");

const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const TOKEN = "9f7a7fd4c881d42e259f7f0ca0aa0.2537675";
const ENDPOINT = "https://send.api.mailtrap.io/";

const sendMailUsingMailtrapAPI = async () => {
  try {
    const sender = {
      email: "mailtrap@demomailtrap.com",
      name: "Mailtrap Test",
    };
    const recipients = [
      {
        email: "hackersuraj2018@gmail.com",
      },
    ];

    const payload = {
      from_email: sender.email,
      to_email: recipients.map((recipient) => recipient.email).join(","),
      subject: "You are awesome!",
      text: "Congrats for sending test email with Mailtrap!",
      category: "Integration Test",
    };

    const response = await axios.post(ENDPOINT, payload, {
      headers: {
        "Api-Token": TOKEN,
        "Content-Type": "application/json",
      },
    });

    console.log("Email sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending email:", error.response.data);
  }
};
