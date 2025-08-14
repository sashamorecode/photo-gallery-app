<script>
    import Navbar from "$lib/Navbar.svelte";
</script>

<div
    class="flex h-screen bg-black text-white overflow-hidden font-amiko font-[400]"
>
    <Navbar></Navbar>
    <div class="w-full lg:pl-4 lg:w-auto h-full">
        <div class=" lg:hidden pt-3 pl-12">
            <h1 class="text-4xl mb:text-3xl">Jonas Schledorn</h1>
            <h2 class="text-base mb-8 text-gray-600">PHOTOGRAPHER</h2>
        </div>
        <img
            src="./HomePageImage.jpg"
            alt="Photography work"
            class="object-scale-down max-h-full rounded-lg drop-shadow-lg m-auto pl-8 pr-8 lg:pr-0 lg:p-8 lg:pl-0"
        />
    </div>
</div>
