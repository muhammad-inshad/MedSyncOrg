import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.error(" ERROR: MAIL_USER or MAIL_PASS is not defined in .env file");
}
export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
