<script>
    import Navbar from "$lib/Navbar.svelte";
    import { Carousel, Controls, CarouselIndicators } from "flowbite-svelte";
    import ControlButton from "flowbite-svelte/ControlButton.svelte";
    import { deferIdle, warmImage, warmWithTimeout } from "$lib/imageWarm.js";
    let { data } = $props();
    const images = $state(
        data.homepage_images.map((image, i) => ({
            src: image.src,
            srcset: image.srcset,
            sizes: image.sizes,
            width: image.width,
            height: image.height,
            decoding: "async",
            fetchpriority: i === 0 ? "high" : "low",
        })),
    );
    let imageIdx = $state(0);

    $effect(() => {
        const idx = imageIdx;
        const neighbours = [images[idx - 1], images[idx + 1]].filter(Boolean);
        if (neighbours.length === 0) return;
        return deferIdle(() => {
            for (const image of neighbours) warmImage(image);
        });
    });
</script>

<svelte:head>
    {#if images[0]}
        <link
            rel="preload"
            as="image"
            fetchpriority="high"
            href={images[0].src}
            imagesrcset={images[0].srcset}
            imagesizes={images[0].sizes}
        />
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
        <div class="overflow-hidden relative flex-1 flex items-center justify-center my-2 lg:pt-0 lg:my-8 lg:translate-x-[-4rem] h-full">
            <Carousel
                {images}
                bind:index={imageIdx}
                duration={0}
                imgClass="object-contain size-full"
                style="height: 100%;"
                class="bg-transparent flex h-[92vh] w-full lg:w-[70vw] lg:h-[80vh]"
            >
                <Controls>
                    {#snippet children(changeSlide)}
                        <ControlButton name="Previous" forward={false}
                            onclick={() => { if (imageIdx > 0) warmWithTimeout(images[imageIdx - 1]).then(() => changeSlide(false)); }}
                            class={imageIdx === 0 ? "opacity-30 !cursor-not-allowed" : ""}
                        />
                        <ControlButton name="Next" forward={true}
                            onclick={() => { if (imageIdx < images.length - 1) warmWithTimeout(images[imageIdx + 1]).then(() => changeSlide(true)); }}
                            class={imageIdx === images.length - 1 ? "opacity-30 !cursor-not-allowed" : ""}
                        />
                    {/snippet}
                </Controls>
            </Carousel>
        </div>
    </div>
</div>
