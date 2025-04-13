import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (options) => {
  try {
    console.log("Sending email to:", options.email);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.PASS_USER
      },
    });

    const mailOptions = {
      from: '"NPathways Support 👻" <sohailaabdelazeem863@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email Sending Error:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
