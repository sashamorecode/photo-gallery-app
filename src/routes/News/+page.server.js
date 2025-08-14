import * as db from "$lib/server/database.js"

export function load() {
    const news = db.getNews()
    return {
        news
    };
}
