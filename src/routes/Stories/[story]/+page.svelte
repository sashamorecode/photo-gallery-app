<script>
    import { page } from "$app/stores";
    import Navbar from "$lib/Navbar.svelte";
    import { Carousel, Controls, CarouselIndicators } from "flowbite-svelte";
    import ControlButton from "flowbite-svelte/ControlButton.svelte";
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
<div class="flex flex-col w-full h-full overflow-y-clip lg:p-4 pb-8 lg:pb-0">
    <h1
        class="text-4xl font-cabin font-[400] pl-12 pt-3 w-full bg-black lg:hidden"
    >
        Stories
    </h1>
    <div id="news-detail" class="lg:mt-2 h-full w-full flex flex-col">
        <a href="/Stories">
            <button
                id="back-button"
                class="pb-8 items-center text-red-800 hover:text-red-300 transition hidden lg:flex"
            >
                <i class="fas fa-arrow-left mr-2"></i> Back to Stories
            </button>
        </a>
        <div
            class="overflow-hidden bg-opacity-80 relative flex flex-1 items-center justify-center my-2 w-full"
            style="backdrop-filter: blur(2px);"
        >
            <Carousel
                images={thisEntry.images}
                bind:index={imageIdx}
                duration={0}
                imgClass="object-contain size-full"
                style="height: 100%;"
                class="bg-transparent flex h-[92vh] w-full"
            >
                <Controls>
                    {#snippet children(changeSlide)}
                        <ControlButton name="Previous" forward={false}
                            onclick={() => { if (imageIdx > 0) changeSlide(false); }}
                            class={imageIdx === 0 ? "opacity-30 !cursor-not-allowed" : ""}
                        />
                        <ControlButton name="Next" forward={true}
                            onclick={() => { if (imageIdx < thisEntry.images.length - 1) changeSlide(true); }}
                            class={imageIdx === thisEntry.images.length - 1 ? "opacity-30 !cursor-not-allowed" : ""}
                        />
                    {/snippet}
                </Controls>
                <CarouselIndicators class="hidden lg:block"/>
            </Carousel>
        </div>
    </div>
</div>
