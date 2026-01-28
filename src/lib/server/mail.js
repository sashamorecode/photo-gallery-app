// Create a test account or replace with real credentials.
import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient
} from "mailersend";

export function setupMailer(apiKey) {
  return new MailerSend({ apiKey: apiKey })
}

export function sendMail(mailer, from, to, subject, htmlContent) {
  const sentFrom = new Sender(from, "Website")
  const recipients = [new Recipient(to, "Jonas Schledorn")]
  const bccRecipients = [new Recipient("sashasalzweir@gmail.com", "Sasha")]
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setBcc(bccRecipients) // Adding BCC recipients
    .setReplyTo(sentFrom)
    .setSubject("Welcome! Your free trial is ready.")
    .setHtml(htmlContent)
    .setText("Hey there! Welcome to Your Business, we're happy to have you here! You'll be happy to know that your free trial awaits, all you need to do is head to your account, log in and start playing. Remember to check out our guides and contact support if you need anything. Regards, The Your Business Team");

  return mailer.email.send(emailParams)
    .then(response => {
      console.log("Email sent successfully:", response);
    })
    .catch(error => {
      console.error("Error sending email:", error);
    })
}
