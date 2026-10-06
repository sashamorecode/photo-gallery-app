import * as db from "$lib/server/database.js";

export function load() {
    const bio = db.getBio();
    return {
        bio,
    };
}
