<script>
    import Navbar from "$lib/Navbar.svelte";
    let { data } = $props();
    let storys = data.stories;
    console.log(storys);
</script>


<Navbar />
<div class="w-full h-full overflow-y-auto lg:p-4 lg:pl-4">
    <h1
        class="text-4xl font-cabin font-[400] pl-12 pt-3 absolute w-full bg-black pb-4 lg:hidden"
    >
        Stories
    </h1>
    <div class="pt-20 lg:pt-4 grid grid-cols-1 gap-6 p-4">
        <!-- Story Items -->
        {#each storys as { coverImage, title, url, alt }}
            <a href="/Stories/{url}">
                <div
                    class="story-item m-auto "
                    data-story="1"
                >
                    <div class="relative w-full lg:w-3/4 cursor-pointer group lg:mx-auto">
                        <img
                            src={coverImage}
                            {alt}
                            class="w-full object-cover rounded-lg transition-transform lg:group-hover:scale-[101%]"
                        />
                        <h1
                            class="transition-transform absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4
                                   text-4xl group-hover:bg-black/80 bg-black/60 p-2 rounded-lg
                                   font-semibold"
                        >
                            {title}
                        </h1>
                    </div>
                </div>
            </a>
        {/each}
    </div>
</div>
