<script>
    import Navbar from "$lib/Navbar.svelte";
    let storys = [
        {
            cover: "/s1-1.jpg",
            title: "Story 1",
            images: [
                {
                    src: "/s1-1.jpg",
                    caption: "Image Caption",
                },
                {
                    src: "/s1-2.jpg",
                    caption: "Image Caption",
                },
                {
                    src: "/s1-3.jpg",
                    caption: "Image Caption",
                },
            ],
        },
        {
            cover: "/s2-1.jpg",
            title: "Story 1",
            images: [
                {
                    src: "/s2-1.jpg",
                    caption: "Image Caption",
                },
                {
                    src: "/s2-2.jpg",
                    caption: "Image Caption",
                },
                {
                    src: "/s2-3.jpg",
                    caption: "Image Caption",
                },
            ],
        },
    ];
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
        {#each storys as { cover, title }}
            <div class="story-item cursor-pointer group" data-story="1">
                <img
                    src={cover}
                    alt={title}
                    class="w-3/4 m-auto object-cover rounded-lg transition-transform lg:group-hover:scale-[101%]"
                />
                <h3 class="mt-4 text-xl text-center group-hover:text-red-800">
                    {title}
                </h3>
            </div>
        {/each}
    </div>
</div>
