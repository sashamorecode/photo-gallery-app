<script>
  import Navbar from "$lib/Navbar.svelte";
  let { data } = $props();
  let storys = data.stories;
  console.log(storys);
</script>

<Navbar />
<div class="w-full h-full overflow-y-auto pb-12 lg:pb-0">
  <h1
    class="text-4xl font-cabin font-[400] pl-12 pt-3 absolute w-full bg-black pb-4 lg:hidden"
  >
    Stories
  </h1>
  <div class="pt-20 lg:pt-20 mx-auto grid grid-cols-1 gap-6 p-4 lg:pl-0">
    <!-- Story Items -->
    {#each storys as { coverImage, title, url, alt }}
      <a href="/Stories/{url}" data-sveltekit-preload-data>
        <div class="block story-item mx-auto" data-story="1">
          <div class="relative w-full lg:w-3/4 cursor-pointer group lg:mx-auto">
            <img
              src={coverImage}
              {alt}
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
