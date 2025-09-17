// Create a test account or replace with real credentials.
import nodemailer from "nodemailer";
//
export function setupMailer(user, pass) {
    let mailer = nodemailer.createTransport({
        host: "smtp.mailersend.net",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: user,
            pass: pass,
        },
    });
    return mailer
}

// Wrap in an async IIFE so we can use await.
export function sendMail(mailer,from, to, subject, html) {
    return mailer.sendMail({
        from: from,
        to: to,
        subject: subject,
        text: "",
        html: html,
    });
}
