import * as db from "$lib/server/database.js";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
    // Build JSON object
    const jsonData = await request.json();

    // TODO: Save to database or process as needed
    // e.g., await db.news.create({ data: jsonData });
    db.createNews(jsonData);
    return json({
        success: true,
        data: jsonData,
    });
}
