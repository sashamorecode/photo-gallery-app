<script>
    import { page } from "$app/stores";
    import Navbar from "$lib/Navbar.svelte";
    import { Carousel, Controls, CarouselIndicators } from "flowbite-svelte";
    let { data } = $props();
    let storys = data.stories;

    let entryUrl = $page.params.story;
    console.log(entryUrl);
    let thisEntry = storys.find((entry) => entry.url === entryUrl);

    // Carousel Modal State
    let showCarousel = $state(false);
    let imageIdx = $state(0);

    let image = $state();

    function openCarousel(idx) {
        imageIdx = idx;
        showCarousel = true;
        document.body.style.overflow = "hidden"; // prevent scroll
    }
    function closeCarousel() {
        showCarousel = false;
        document.body.style.overflow = ""; // restore scroll
    }
    let isPageLoaded = $state(false);
    setTimeout(() => {
        isPageLoaded = true;
    }, 500);
</script>

<svelte:head>
    {#if isPageLoaded}
        {#each thisEntry.images as image, idx}
            {#if Math.abs(imageIdx - idx) < 3}
                <link rel="preload" as="image" href={image.src} />
            {/if}
        {/each}
    {/if}
</svelte:head>
<Navbar />
<div class="w-full h-full overflow-y-clip lg:p-4">
    <h1
        class="text-4xl font-cabin font-[400] pl-12 pt-3 w-full bg-black pb-4 lg:hidden"
    >
        News
    </h1>
    <div class="w-full h-full lg:pt-0 p-4">
        <div id="news-detail" class="mt-8 h-full w-full">
            <a href="/Stories">
                <button
                    id="back-button"
                    class="mb-6 items-center text-red-800 hover:text-red-300 transition hidden lg:flex"
                >
                    <i class="fas fa-arrow-left mr-2"></i> Back to Stories
                </button>
            </a>
            <div
                class="bg-opacity-80 flex items-center justify-center size-full"
                style="backdrop-filter: blur(2px);"
            >
                <div class="relative w-full h-full -top-1/12 lg:top-0 pt-10">
                    <div
                        class="hidden lg:block absolute text-4xl left-1/2 -translate-x-1/4 -translate-y-8 text-center z-10 font-[courier]"
                    >
                        {thisEntry.title}
                    </div>
                    <Carousel
                        images={thisEntry.images}
                        bind:index={imageIdx}
                        duration={0}
                        imgClass="object-contain"
                        style="height: 90%;"
                        class="bg-transparent flex"
                    >
                        <Controls />
                        <CarouselIndicators />
                    </Carousel>
                </div>
            </div>
        </div>
    </div>
</div>
