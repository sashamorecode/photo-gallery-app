import { render } from "svelte/server";
import Contact from "$lib/emails/Contact.svelte";
import { sendMail, setupMailer } from "$lib/server/mail.js";
import { MAILPASS, MAILUSER } from "$env/static/private";
import { json } from "@sveltejs/kit";

setupMailer(MAILUSER, MAILPASS);
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
        "Contact Me Form <conact-form@jonasschledorn.com>",
        "sashasalzweir@gmail.com",
        "Contact Request from: " + jsonData.name,
        mail.html,
    );
    console.log(res);
    return json({
        success: true,
    });
}
