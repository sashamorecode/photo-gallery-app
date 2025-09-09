import * as db from "$lib/server/database.js"

export function load() {
    const stories = db.getStories()
    return {
        stories
    };
}
