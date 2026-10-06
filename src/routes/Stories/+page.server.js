import * as db from "$lib/server/database.js"
import { withResponsive } from "$lib/server/responsiveImages.js"

export async function load() {
    const stories = db.getStories()
    await Promise.all(
        stories.map(async (story) => {
            if (!story.coverImage) return
            const cover = await withResponsive(
                { src: story.coverImage },
                { sizes: "(min-width: 1024px) 75vw, 100vw" }
            )
            story.coverWidth = cover.width
            story.coverHeight = cover.height
            story.coverSrcset = cover.srcset
            story.coverSizes = cover.sizes
        })
    )
    return {
        stories
    };
}
