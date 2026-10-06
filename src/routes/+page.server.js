import * as db from "$lib/server/database.js"
import { withResponsiveAll } from "$lib/server/responsiveImages.js"

export async function load() {
    const homepage_images = await withResponsiveAll(
        db.getHomepage(),
        { sizes: "(min-width: 1024px) 70vw, 100vw" }
    )
    return {
        homepage_images
    };
}
