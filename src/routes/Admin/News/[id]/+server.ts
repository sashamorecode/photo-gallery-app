import * as db from "$lib/server/database.js"
import { json } from '@sveltejs/kit';

export async function DELETE({ params }) {
    db.deleteNews(params.id)
    const news = db.getNews()
    return json({
        success: true,
        newNews: news
    });
}
export async function PUT({ params, request }) {
    let id = params.id
    const jsonData = await request.json();
    // Build JSON object
    // TODO: Save to database or process as needed
    // e.g., await db.news.create({ data: jsonData });
    db.updateNews(id, jsonData);
    return json({
        success: true,
    });
}
