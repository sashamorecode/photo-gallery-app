// Create a test account or replace with real credentials.
import nodemailer from "nodemailer";
//
var mailer = null;
export function setupMailer(user, pass) {
    mailer = nodemailer.createTransport({
        host: "smtp.mailersend.net",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: user,
            pass: pass,
        },
    });
}

// Wrap in an async IIFE so we can use await.
export function sendMail(to, subject, html) {
    return mailer.sendMail({
        from: '"Photo Gallery Site" <jonasschledorn-gallery@test-y7zpl98q8p545vx6.mlsender.net>',
        to: to,
        subject: subject,
        text: "",
        html: html,
    });
}
