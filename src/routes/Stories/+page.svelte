<script>
    import Navbar from "$lib/Navbar.svelte";
    let { data } = $props();
    let storys = data.stories;
</script>

<Navbar />
<div class="w-full h-full overflow-y-auto lg:pl-4 lg:p-4">
    <h1
        class="text-4xl font-cabin font-[400] pl-12 pt-3 pb-3 absolute w-full bg-black pb-4 lg:hidden"
    >
        Stories
    </h1>
    <div class="pt-20 lg:pt-4 grid grid-cols-1 gap-6 p-4">
        <!-- Story Items -->
        {#each storys as { cover, title, url }}
            <a href="/Stories/{url}">
                <div class="story-item cursor-pointer group" data-story="1">
                    <img
                        src={cover}
                        alt={title}
                        class="w-3/4 m-auto object-cover rounded-lg transition-transform lg:group-hover:scale-[101%]"
                    />
                    <h3
                        class="mt-4 text-xl text-center group-hover:text-red-800"
                    >
                        {title}
                    </h3>
                </div>
            </a>
        {/each}
    </div>
</div>
