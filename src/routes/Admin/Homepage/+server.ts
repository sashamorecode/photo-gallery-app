import * as db from "$lib/server/database.js"
import { json } from '@sveltejs/kit';

export async function PUT({ params, request }) {
    const jsonData = await request.json();
    // Build JSON object
    // TODO: Save to database or process as needed
    // e.g., await db.news.create({ data: jsonData });
    db.updateHompage(jsonData);
    return json({
        success: true,
    });
}
