import * as db from "$lib/server/database.js"
import { redirect } from "@sveltejs/kit";

export function load() {
    const images = db.getHomepage()
    if (!images) {
        throw (redirect(303, "/Admin/Homaepage/Update"))
    }
    return {
      images
    };
}
