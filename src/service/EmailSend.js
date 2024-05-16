const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const { OtpModel } = require("../models");
const otp = require("../models/otp.model");
const dotenv = require("dotenv");
const SendMailAnywhere = require("./EmailService");
dotenv.config();

const SendMailWithTemplate = async (mail, otp, username) => {
  try {
    const templatePath = path.join(__dirname, "../views/otp.ejs");
    const data = await ejs.renderFile(templatePath, { otp, username });
    await SendMailAnywhere(mail, data, (subject = "Email Verification "));
  } catch (err) {
    console.log(err);
  }
};
const SendMailLeaveAppliation = async (
  mail,
  username,
  application_no,
  startDate,
  endDate,
  totalleave
) => {
  try {
    const EmailTemplatePath = path.join(
      __dirname,
      "../views/leave_application.ejs"
    );
    const data = await ejs.renderFile(EmailTemplatePath, {
      username,
      application_no,
      startDate,
      endDate,
      totalleave,
    });
    console.log("data is showing ", data);
    await SendMailAnywhere(mail, data, (subject = " Leave Application"));
  } catch (error) {
    console.log(error);
  }
};

const ApprovedApplicationEmailTemplate = async (
  mail,
  username,
  application_no,
  startDate,
  endDate,
  totalLeave
) => {
  try {
    const EmailTemplatePath = path.join(__dirname, "../views/approved.ejs");
    const data = await ejs.renderFile(EmailTemplatePath, {
      username,
      application_no,
      startDate,
      endDate,
      totalLeave,
    });
    await SendMailAnywhere(
      mail,
      data,
      (subject = "Approved Leave Application")
    );
  } catch (error) {
    console.log("error is:", error);
  }
};

const RejectApplicationEmailTemplate = async (
  mail,
  username,
  application_no,
  startDate,
  endDate
) => {
  try {
    const EmailTemplatePath = path.join(__dirname, "../views/reject.ejs");
    const data = await ejs.renderFile(EmailTemplatePath, {
      username,
      application_no,
      startDate,
      endDate,
    });
    await SendMailAnywhere(
      mail,
      data,
      (subject = "Rejected Leave Application")
    );
  } catch (error) {
    console.log("error is:", error);
  }
};
const TimeApplicationEmailTemplate = async (
  mail,
  username,
  application_no,
  totalTime
) => {
  try {
    const EmailTemplatePath = path.join(__dirname, "../views/timereapply.ejs");
    const data = await ejs.renderFile(EmailTemplatePath, {
      username,
      application_no,

      totalTime,
    });
    await SendMailAnywhere(
      mail,
      data,
      (subject = "Rejected Leave Application")
    );
  } catch (error) {
    console.log("error is:", error);
  }
};
console.log("working 1");
// ApprovedApplicationEmailTemplate(
//   "surajkumar@yopmail.com",
//   "surajkumar",
//   "SUR003251",
//   "20/10/2024",
//   "12/11/2024",
//   " 8 days"
// );
// SendMailWithTemplate("surajkumar@yopmail.com", "123420", "surajkumar");
const GeneratorOtp = async (emaildata) => {
  const character =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
  let result = "";
  const characterLength = character.length;
  for (let i = 0; i < 6; i++) {
    result += character.charAt(Math.floor(Math.random() * characterLength));
  }
  // const { email } = emaildata;
  // console.log(emaildata);
  // console.log("send mail is ", email);
  const Otp = await OtpModel.create({
    email: emaildata,
    otp: result.toUpperCase(),
  });
  console.log(Otp);
  return Otp;
};

const SendOnlyEmailForgate = async (email, token) => {
  try {
    const resetPasswordLink = `
 http://localhost:5173/reset-password/${token}`;
    const templtepath = path.join(__dirname, "../views/Reset.ejs");
    const data = await ejs.renderFile(templtepath, { resetPasswordLink });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      // secure: true, // use SSL
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      html: data,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// console.log(data);

module.exports = {
  SendMailWithTemplate,
  GeneratorOtp,
  SendMailLeaveAppliation,
  SendOnlyEmailForgate,
  ApprovedApplicationEmailTemplate,
  RejectApplicationEmailTemplate,
  TimeApplicationEmailTemplate,
};

// GeneratorOtp("surajkumar@gmaml.com");
