import * as db from "$lib/server/database.js"
import { withResponsiveAll } from "$lib/server/responsiveImages.js"

export async function load({ params }) {
    const news = db.getNews()
    const current = news.find((entry) => entry.url === params.newsEntry)
    if (current?.images) {
        const responsive = await withResponsiveAll(current.images, {
            sizes: "(min-width: 768px) 33vw, 100vw"
        })
        current.images = responsive.map((image) => ({
            ...image,
            decoding: "async",
        }))
    }
    return {
        news
    };
}
