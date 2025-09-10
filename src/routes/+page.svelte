<script>
    import Navbar from "$lib/Navbar.svelte";
    import { Carousel, Controls, CarouselIndicators } from "flowbite-svelte";
    let { data } = $props();
    const images = data.homepage_images;
    console.log(images);
    let imageIdx = $state(0);
</script>

<div
    class="flex h-screen w-full bg-black text-white overflow-hidden font-amiko font-[400]"
>
    <Navbar></Navbar>
    <div class="w-full lg:pl-4 h-full">
        <div class=" lg:hidden pt-3 pl-12">
            <h1 class="text-4xl mb:text-3xl">Jonas Schledorn</h1>
            <h2 class="text-base mb-8 text-gray-600">PHOTOGRAPHER</h2>
        </div>
        <div class="overflow-hidden relative mt-20 size-full">
            <Carousel
                {images}
                bind:index={imageIdx}
                duration={0}
                imgClass="object-contain size-full"
                style=";"
                class="bg-transparent flex xl:h-[80vh] sm:h-[80vh] 2xl:h-[80vh] lg:mr-56"
            >
                <Controls />
                <CarouselIndicators />
            </Carousel>
        </div>
    </div>
</div>
