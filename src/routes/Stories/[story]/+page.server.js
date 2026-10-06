import * as db from "$lib/server/database.js"
import { withResponsiveAll } from "$lib/server/responsiveImages.js"

export async function load({ params }) {
    const stories = db.getStories()
    const current = stories.find((story) => story.url === params.story)
    if (current?.images) {
        const responsive = await withResponsiveAll(current.images, {
            sizes: "100vw"
        })
        current.images = responsive.map((image) => ({
            ...image,
            decoding: "async",
        }))
    }
    return {
        stories
    };
}
