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
        const title = form.get('title')?.toString() || '';
        const description = form.get('description')?.toString() || '';
        const src = form.get('src')?.toString() || '';
        // Parse dynamic image data
        const sizes: { size: string; price: string }[] = [];
        // We don't know how many images there are, so we detect them
        // based on keys in FormData
        const sizeMap: Record<number, { size?: string; price?: string; }> = {};

        for (const [key, value] of form.entries()) {
            const match = key.match(/^prices\[(\d+)\]\[(size|price)\]$/);
            if (match) {
                const index = parseInt(match[1]);
                const field = match[2] as 'size' | 'price';
                if (!sizeMap[index]) sizeMap[index] = {};
                sizeMap[index][field] = value.toString();
            }
        }

        // Convert the map to an ordered array
        for (const idx of Object.keys(sizeMap).map(Number).sort((a, b) => a - b)) {
            const size = sizeMap[idx];
            sizes.push({
                size: size.size || '',
                price: size.price || '',
            });
        }

        // Build JSON object
        const jsonData = {
            title,
            description,
            src,
            sizes
        };


        // TODO: Save to database or process as needed
        // e.g., await db.news.create({ data: jsonData });
        db.createPrint(jsonData)
        return {
            success: true,
            data: jsonData
        };
    }
};

