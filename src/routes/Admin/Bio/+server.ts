import * as db from "$lib/server/database.js";
import { json } from "@sveltejs/kit";

export async function PUT({ request }) {
    const jsonData = await request.json();
    db.updateBio(jsonData);
    return json({
        success: true,
    });
}
