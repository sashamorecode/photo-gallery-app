<script>
    import Navbar from "$lib/Navbar.svelte";

    let { data } = $props();
    const bio = data.bio;
</script>

<div
    class="flex h-screen bg-black text-white overflow-hidden font-amiko font-[400]"
>
    <Navbar></Navbar>
    <div class="w-full h-full lg:pl-4 lg:p-8 overflow-scroll">
        <div class="lg:pt-0 lg:pr-4">
            <h1
                class="text-4xl font-cabin font-[400] text-center pt-3 pb-3 absolute w-full bg-black lg:hidden"
            >
                Biography
            </h1>
            <div class="overflow-hidden p-4 pt-0 lg:pl-0"> <div class="flex flex-col mb-8">
                    <div
                        class="w-full px-8 pt-16 lg:pt-0 lg:w-1/4 lg:px-0 m-auto mb-6"
                    >
                        <img
                            src={bio.image}
                            alt="Jonas Portrait"
                            class="w-full h-auto object-contain rounded-lg shadow-lg"
                        />
                    </div>
                    <div class="w-full lg:w-1/3 m-auto text-xl font-[300]">
                        <p
                            class="mb-4 text-gray-300 leading-relaxed text-center whitespace-pre-line"
                        >
                            {bio.text}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
