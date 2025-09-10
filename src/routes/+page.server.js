import * as db from "$lib/server/database.js"

export function load() {
    const homepage_images = db.getHomepage()
    return {
        homepage_images
    };
}
