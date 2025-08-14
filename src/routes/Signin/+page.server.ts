import type { Actions } from './$types';
import { PASSWORD } from '$env/static/private';
import { redirect, fail } from '@sveltejs/kit';

let triesLeft = 10
export const actions: Actions = {
    default: async ({ request, cookies }) => {
        if (triesLeft <= 0) {
            return fail(401, { incorrect: true, triesLeft: 0 })
        }
        const data = await request.formData();
        const password = data.get('password');

        if (password === PASSWORD) {
            cookies.set('admin-session', password, {
                path: '/',
                maxAge: 60 * 60 * 24 // 1 day
            });
            triesLeft = 10
            throw redirect(303, '/Admin');
        }
        triesLeft--
        return fail(401, triesLeft);
    }
};

