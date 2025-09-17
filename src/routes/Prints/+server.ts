import { render } from "svelte/server";
import Printorder from "$lib/emails/Printorder.svelte";
import { sendMail, setupMailer } from "$lib/server/mail.js";
import { MAILPASS, MAILUSER } from "$env/static/private";
import { json } from "@sveltejs/kit";

const mailer = setupMailer(MAILUSER, MAILPASS);
export async function POST({ request }) {
    const jsonData = await request.json();
    console.log(jsonData)
    const mail = render(Printorder, {
        props: {
            print: jsonData.print,
            price: jsonData.price,
            email: jsonData.email,
            address: jsonData.address,
            message: jsonData.message,
        },
    });
    const res = await sendMail(
        mailer,
        "New Print Request <print-shop@jonasschledorn.com>",
        "sashasalzweir@gmail.com",
        "Request for print " + jsonData.title,
        mail.html,
    );
    console.log(res);
    return json({
        success: true,
    });
}
