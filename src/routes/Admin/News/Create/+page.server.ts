import type { Actions, PageServerLoad } from './$types';
import * as db from "$lib/server/database.js"
export const load: PageServerLoad = async () => {
    // You can pass any default data to the page here if needed
    return {};
};

export const actions: Actions = {
    default: async ({ request }) => {
        const form = await request.formData();

        // Get simple fields
        const url = form.get('url')?.toString() || '';
        const title = form.get('title')?.toString() || '';
        const coverImage = form.get('coverImage')?.toString() || '';
        const date = form.get('date')?.toString() || '';
        const newsType = form.get('newsType')?.toString() || '';
        const content = form.get('content')?.toString() || '';

        // Parse dynamic image data
        const images: { src: string; alt: string; title: string }[] = [];
        // We don't know how many images there are, so we detect them
        // based on keys in FormData
        const imageMap: Record<number, { src?: string; alt?: string; title?: string }> = {};

        for (const [key, value] of form.entries()) {
            const match = key.match(/^images\[(\d+)\]\[(src|alt|title)\]$/);
            if (match) {
                const index = parseInt(match[1]);
                const field = match[2] as 'src' | 'alt' | 'title';
                if (!imageMap[index]) imageMap[index] = {};
                imageMap[index][field] = value.toString();
            }
        }

        // Convert the map to an ordered array
        for (const idx of Object.keys(imageMap).map(Number).sort((a, b) => a - b)) {
            const img = imageMap[idx];
            images.push({
                src: img.src || '',
                alt: img.alt || '',
                title: img.title || ''
            });
        }

        // Build JSON object
        const jsonData = {
            url,
            title,
            coverImage,
            date,
            newsType,
            images,
            content
        };


        // TODO: Save to database or process as needed
        // e.g., await db.news.create({ data: jsonData });
        db.createNews(jsonData)
        return {
            success: true,
            data: jsonData
        };
    }
};

