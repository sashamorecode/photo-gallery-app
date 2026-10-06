<script>
  import Navbar from "$lib/Navbar.svelte";
  import { preloadData } from "$app/navigation";
  import { isSaveData, warmImage } from "$lib/imageWarm.js";
  let { data } = $props();
  let storys = data.stories;

  /** @param {string} url */
  async function warmStory(url) {
    if (isSaveData()) return;
    try {
      const result = await preloadData(`/Stories/${url}`);
      if (result.type !== "loaded") return;
      const story = Array.isArray(result.data?.stories)
        ? result.data.stories.find(/** @param {{ url: string }} s */ (s) => s.url === url)
        : undefined;
      const first = story?.images?.[0];
      if (first) warmImage(first);
    } catch {
      // preloading/warming is best-effort; ignore failures
    }
  }
</script>

<svelte:head>
  {#if storys[0]?.coverImage}
    <link
      rel="preload"
      as="image"
      fetchpriority="high"
      href={storys[0].coverImage}
      imagesrcset={storys[0].coverSrcset}
      imagesizes={storys[0].coverSizes}
    />
  {/if}
</svelte:head>

<Navbar />
<div class="w-full h-full overflow-y-auto pb-12 lg:pb-0">
  <h1
    class="text-4xl font-cabin font-[400] pl-12 pt-3 absolute w-full bg-black pb-4 lg:hidden"
  >
    Stories
  </h1>
  <div class="pt-20 lg:pt-20 mx-auto grid grid-cols-1 gap-6 p-4 lg:pl-0">
    <!-- Story Items -->
    {#each storys as { coverImage, title, url, alt, coverWidth, coverHeight, coverSrcset, coverSizes }, i}
      <a href="/Stories/{url}" data-sveltekit-preload-data
        onpointerenter={() => warmStory(url)}
        onfocus={() => warmStory(url)}
        ontouchstart={() => warmStory(url)}
      >
        <div class="block story-item mx-auto" data-story="1">
          <div class="relative w-full lg:w-3/4 cursor-pointer group lg:mx-auto">
            <img
              src={coverImage}
              {alt}
              width={coverWidth}
              height={coverHeight}
              srcset={coverSrcset}
              sizes={coverSizes}
              loading={i === 0 ? "eager" : "lazy"}
              fetchpriority={i === 0 ? "high" : "low"}
              decoding="async"
              class="max-w-full h-auto max-h-[75vh] object-contain rounded-lg transition-transform lg:group-hover:scale-[101%] mx-auto"
            />
            <h1
              class="text-center transition-transform text-2xl group-hover:scale-105 px-2 pt-2 rounded-lg"
            >
              {title}
            </h1>
          </div>
        </div>
      </a>
    {/each}
  </div>
</div>
