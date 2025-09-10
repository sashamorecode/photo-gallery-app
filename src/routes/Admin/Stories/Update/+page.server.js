import * as db from "$lib/server/database.js"
import { redirect } from "@sveltejs/kit";

export function load() {
    const stories = db.getStories()
    if (!stories) {
        throw (redirect(303, "/Admin/Stories/Create"))
    }
    return {
        stories
    };
}
