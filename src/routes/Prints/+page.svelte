<script>
    import Navbar from "$lib/Navbar.svelte";
    let { data } = $props();
    let printListings = data.prints;
    console.log(printListings);
    printListings = [
        ...printListings,
        {
            src: "/n1-1.jpg",
            title: "Print 1",
            description: "Replace this text with description of print",
            sizes: [
                { size: "20cmx20cm", price: "10" },
                { size: "40cmx40cm", price: "15" },
                { size: "100cmx100cm", price: "20" },
            ],
        },
        {
            src: "/n2-1.jpg",
            title: "Print 2",
            description: "Replace this text with description of print",
            sizes: [
                { size: "20cmx20cm", price: "10" },
                { size: "40cmx40cm", price: "15" },
                { size: "100cmx100cm", price: "20" },
            ],
        },
        {
            src: "/n2-2.jpg",
            title: "Print 3",
            description: "Replace this text with description of print",
            sizes: [
                { size: "20cmx20cm", price: "10" },
                { size: "40cmx40cm", price: "15" },
                { size: "100cmx100cm", price: "20" },
            ],
        },
        {
            src: "/n2-3.jpg",
            title: "Print 4",
            description: "Replace this text with description of print",
            sizes: [
                { size: "20cmx20cm", price: "10" },
                { size: "40cmx40cm", price: "15" },
                { size: "100cmx100cm", price: "20" },
            ],
        },
    ];
    let currentPrint = $state(printListings[0]);
    let buyPageOpen = $state(false);
    function onClickListing(event) {
        currentPrint = printListings[this.id];
        buyPageOpen = true;
    }
</script>

<Navbar />

<div class="w-full h-full overflow-y-auto lg:pl-4 lg:p-4">
    <h1
        class="text-4xl font-cabin font-[400] pl-12 pt-3 pb-3 absolute w-full bg-black pb-4 lg:hidden"
    >
        Prints
    </h1>
    <div class="pt-20 lg:pt-4 grid grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        <!-- Story Items -->
        {#each printListings as { src, title }, idx}
            <div
                class="print-item cursor-pointer group"
                id={idx}
                onclick={onClickListing}
            >
                <img
                    {src}
                    alt="Story 1"
                    class="w-full m-auto object-cover rounded-lg transition-transform lg:group-hover:scale-[101%]"
                />
                <h3 class="mt-4 text-xl text-center group-hover:text-red-800">
                    {title}
                </h3>
            </div>
        {/each}
        <!-- Add more print items as needed -->
    </div>
    {#if buyPageOpen}
        <div id="print-sell-overlay" class="fixed inset-0 bg-black/80 z-50">
            <div class="relative w-full h-full">
                <button
                    id="close-print-info"
                    class="absolute top-6 right-6 text-white text-4xl p-4 z-50 hover:text-red-800 transition"
                    onclick={() => {
                        buyPageOpen = false;
                    }}
                >
                    &times;
                </button>
                <div
                    id="print-container"
                    class="h-full w-full flex flex-col lg:flex-row items-center justify-center space-x-4"
                >
                    <div class="relative">
                        <img
                            src={currentPrint.src}
                            id="current-print"
                            class="lg:h-[80vh] object-contain"
                        />
                        <div
                            id="print-caption"
                            class="text-right mt-4 text-gray-300 text-lg"
                        ></div>
                    </div>
                    <div
                        id="sell-info-container"
                        class="lg:h-[80vh] lg:max-w-[25vw] rounded-lg p-4 relative top-[-0.5em]
                            bg-black/50"
                    >
                        <h2 id="print-sell-title" class="text-2xl font-bold">
                            {currentPrint.title}
                        </h2>
                        <p
                            id="print-sell-description"
                            class="text-gray-300 mb-4"
                        >
                            {currentPrint.description}
                        </p>
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold">Size:</span>
                            <select
                                id="print-size-select"
                                class="rounded font-bold bg-black/40 py-1 px-2 text-align-last"
                                onchange={(item) => {
                                    document.getElementById(
                                        "print-price",
                                    ).innerHTML =
                                        item.target.selectedOptions[0].value +
                                        " €";
                                }}
                            >
                                {#each currentPrint.sizes as s}
                                    <option id="size-opt" value={s.price}
                                        >{s.size}</option
                                    >
                                {/each}
                            </select>
                        </div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold">Price:</span>
                            <p id="print-price" class="text-lg font-bold">€</p>
                        </div>
                        <div class="flex justify-end">
                            <button
                                id="print-request-button"
                                class="bg-red-800 hover:bg-red-600 px-2 font-bold text-xl rounded w-full"
                                >Request Print</button
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
