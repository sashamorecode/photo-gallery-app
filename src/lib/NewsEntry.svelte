<script>
    import { preloadData } from "$app/navigation";
    import { isSaveData, warmImage } from "$lib/imageWarm.js";
    let {
        coverImage,
        coverWidth,
        coverHeight,
        coverSrcset,
        coverSizes,
        loading = "lazy",
        fetchpriority,
        newsType,
        newsTitle,
        newsDate,
        newsUrl,
    } = $props();

    /** @param {string} url */
    async function warmNews(url) {
        if (isSaveData()) return;
        try {
            const result = await preloadData(`/News/${url}`);
            if (result.type !== "loaded") return;
            const entry = Array.isArray(result.data?.news)
                ? result.data.news.find(/** @param {{ url: string }} n */ (n) => n.url === url)
                : undefined;
            const first = entry?.images?.[0];
            if (first) warmImage(first);
        } catch {
            // preloading/warming is best-effort; ignore failures
        }
    }
</script>
<a href={"/News/"+newsUrl}
    onpointerenter={() => warmNews(newsUrl)}
    onfocus={() => warmNews(newsUrl)}
    ontouchstart={() => warmNews(newsUrl)}
>
<div class="news-item cursor-pointer group" data-news="1">
    <img
        src={coverImage}
        alt={newsTitle}
        width={coverWidth}
        height={coverHeight}
        srcset={coverSrcset}
        sizes={coverSizes}
        {loading}
        {fetchpriority}
        decoding="async"
        class="max-w-full h-auto max-h-[70vh] object-contain rounded-lg group-hover:scale-[101%] duration-300 mx-auto"
    />
    <h3 class="mt-4 text-red-800">{newsType}</h3>
    <h3 class="text-xl group-hover:font-bold duration-75">{newsTitle}</h3>
    <p class="text-gray-400 text-sm mt-1">{newsDate}</p>
</div>
</a>
