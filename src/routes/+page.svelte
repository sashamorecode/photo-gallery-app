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
    <div class="w-full lg:pl-4 h-full flex flex-col">
        <div class="lg:hidden pt-3 pl-12">
            <h1 class="text-4xl lg:text-3xl">Jonas Schledorn</h1>
            <h2 class="text-base lg:mb-8 text-gray-600">PHOTOGRAPHER</h2>
        </div>
        <div class="overflow-hidden relative flex-1 flex items-center justify-center my-2 lg:pt-0 lg:my-8 lg:translate-x-[-2rem] h-full">
            <Carousel
                {images}
                bind:index={imageIdx}
                duration={0}
                imgClass="object-contain size-full"
                style="height: 100%;"
                class="bg-transparent flex h-[92vh] w-full lg:w-[70vw] lg:h-[80vh]"
            >
                <Controls />
            </Carousel>
        </div>
    </div>
</div>
