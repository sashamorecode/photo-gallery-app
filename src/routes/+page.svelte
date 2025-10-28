<script>
    import Navbar from "$lib/Navbar.svelte";
    import { Carousel, Controls, CarouselIndicators } from "flowbite-svelte";
    let { data } = $props();
    const images = $state(data.homepage_images);
    console.log(images);
    let imageIdx = $state(0);
    let isPageLoaded = $state(false);
    setTimeout(() => {
        isPageLoaded = true;
    }, 500);
</script>

<svelte:head>
    {#if isPageLoaded}
        {#each images as image, idx}
            {#if Math.abs(imageIdx - idx) < 3}
                <link rel="preload" as="image" href={image.src} />
            {/if}
        {/each}
    {/if}
</svelte:head>

<div
    class="flex h-screen w-full bg-black text-white overflow-hidden font-amiko font-[400]"
>
    <Navbar></Navbar>
    <div class="w-full lg:pl-4 h-full">
        <div class=" lg:hidden pt-3 pl-12">
            <h1 class="text-4xl mb:text-3xl">Jonas Schledorn</h1>
            <h2 class="text-base mb-8 text-gray-600">PHOTOGRAPHER</h2>
        </div>
        <div class="overflow-hidden relative mt-20 size-full lg:translate-y-0">
            <Carousel
                {images}
                bind:index={imageIdx}
                duration={0}
                imgClass="object-contain size-full"
                style=";"
                class="bg-transparent flex xl:h-[80vh] sm:h-[80vh] 2xl:h-[80vh] lg:mr-56"
            >
                <Controls />
            </Carousel>
        </div>
    </div>
</div>
