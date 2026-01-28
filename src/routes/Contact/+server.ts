import { render } from "svelte/server";
import Contact from "$lib/emails/Contact.svelte";
import { sendMail, setupMailer } from "$lib/server/mail.js";
import { MAIL_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";

const mailer = setupMailer(MAIL_API_KEY);
export async function POST({ request }) {
  const jsonData = await request.json();
  const mail = render(Contact, {
    props: {
      name: jsonData.name,
      email: jsonData.email,
      phone: jsonData.phone,
      message: jsonData.message,
    },
  });
  const res = await sendMail(
    mailer,
    "contact-form@jonasschledorn.com",
    "jonasschledorn@web.de",
    "Contact Request from: " + jsonData.name,
    mail.html,
  );
  console.log(res);
  return json({
    success: true,
  });
}
