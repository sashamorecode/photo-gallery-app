import { PASSWORD } from "$env/static/private"
import { redirect } from "@sveltejs/kit"

//* @type {import('@svelte/kit').Handel} /*
export async function handle({ event, resolve }) {
    if (event.url.pathname.startsWith('/Admin')) {
        const adminCookie = event.cookies.get('admin-session')
        if (adminCookie !== PASSWORD) {
            throw redirect(307, '/Signin');
        }
    }
    const response = await resolve(event)
    return response
}
