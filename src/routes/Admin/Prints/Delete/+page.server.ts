import * as db from "$lib/server/database.js"

export function load() {
    const prints = db.getPrints()
    return {
        prints
    };
}

