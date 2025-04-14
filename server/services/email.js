import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compileTemplate = (templateName, data) => {
  const templatePath = path.join(
    __dirname,
    "../templates",
    `${templateName}.hbs`
  );
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const template = handlebars.compile(templateSource);
  return template(data);
};

const sendEmail = async (options) => {
  try {
    console.log("Sending email to:", options.email);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.PASS_USER,
      },
    });

    // If a template name is provided, compile it with the data
    let htmlContent = "";
    if (options.templateName) {
      htmlContent = compileTemplate(
        options.templateName,
        options.templateData || {}
      );
    }

    const mailOptions = {
      from: '"NPathways Support 👻" <sohailaabdelazeem863@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message || "",
      html: htmlContent || options.html || "",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Email Sending Error:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
