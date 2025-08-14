import * as db from "$lib/server/database.js"
import { json } from '@sveltejs/kit';

export async function DELETE({ params }) {
    db.deletePrint(params.id)
    return json({
        success: true,
    });
}

export async function PUT({ params, request }) {
    let id = params.id
    const jsonData = await request.json();
    // Build JSON object
    // TODO: Save to database or process as needed
    // e.g., await db.news.create({ data: jsonData });
    db.updatePrint(id, jsonData);
    return json({
        success: true,
    });
}
