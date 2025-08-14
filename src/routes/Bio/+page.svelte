<script>
    import Navbar from "$lib/Navbar.svelte";
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
            <div class="overflow-scroll p-4 pt-0 lg:pl-0">
                <div class="flex flex-col mb-8">
                    <div
                        class="w-full max-h-1/2 px-8 pt-16 lg:pt-0 lg:w-1/3 lg:px-0 m-auto mb-6"
                    >
                        <img
                            src="./portrait.jpg"
                            alt="Jonas Portrait"
                            class="w-full rounded-lg shadow-lg p-auto"
                        />
                    </div>
                    <div class="w-full lg:w-1/3 m-auto text-xl font-[300]">
                        <p
                            class="mb-4 text-gray-300 leading-relaxed text-center"
                        >
                            Jonas Schledorn was born and raised around the Ruhr
                            Area in Western Germany. After graduating from media
                            school in 2021, he moved to cologne to study
                            photography at the Fotoakademie-Koeln. He works
                            within the social documentary practice, covering the
                            struggles of everyday life. The goal is to create a
                            connection to the subject which is
                            based on eye level.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
