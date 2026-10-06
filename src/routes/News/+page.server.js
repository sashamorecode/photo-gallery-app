import * as db from "$lib/server/database.js"
import { withResponsive } from "$lib/server/responsiveImages.js"

export async function load() {
    const news = db.getNews()
    await Promise.all(
        news.map(async (entry) => {
            if (!entry.coverImage) return
            const cover = await withResponsive(
                { src: entry.coverImage },
                { sizes: "(min-width: 1024px) 50vw, 100vw" }
            )
            entry.coverWidth = cover.width
            entry.coverHeight = cover.height
            entry.coverSrcset = cover.srcset
            entry.coverSizes = cover.sizes
        })
    )
    return {
        news
    };
}
