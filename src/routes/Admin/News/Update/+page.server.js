import * as db from "$lib/server/database.js"
import { redirect } from "@sveltejs/kit";

export function load() {
    const news = db.getNews()
    if (!news) {
        throw (redirect(303, "/Admin/News/Create"))
    }
    return {
        news
    };
}
