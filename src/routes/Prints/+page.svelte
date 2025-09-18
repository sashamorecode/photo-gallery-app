<script>
    import Navbar from "$lib/Navbar.svelte";
    let { data } = $props();
    let printListings = $state(data.prints);
    let currentPrint = $derived(printListings[0]);
    let email = $state("");
    let address = $state("");
    let message = $state("");
    let currentPrice = $state("");
    let currentSize = $state("");
    let buyPageOpen = $state(false);
    let buyRequestOpen = $state(false);
    let sentPrint = $state(false);
    function onClickListing(event) {
        currentPrint = printListings[this.id];
        currentPrice = currentPrint.sizes[0].price;
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
                id={idx.toString()}
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
        <div id="print-sell-overlay" class="fixed inset-0 bg-black/80 z-30">
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
                                bind:value={currentPrice}
                            >
                                {#each currentPrint.sizes as s, i}
                                    {#if i == 0}
                                        <option
                                            id="size-opt"
                                            selected
                                            value={s.price}>{s.size}</option
                                        >
                                    {:else}
                                        <option id="size-opt" value={s.price}
                                            >{s.size}</option
                                        >
                                    {/if}
                                {/each}
                            </select>
                        </div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold">Price:</span>
                            <p id="print-price" class="text-lg font-bold">
                                {currentPrice}€
                            </p>
                        </div>
                        <div class="flex justify-end">
                            <button
                                id="print-request-button"
                                class="bg-red-800 hover:bg-red-600 px-2 font-bold text-xl rounded w-full"
                                onclick={() => {
                                    buyRequestOpen = true;
                                }}>Request Print</button
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {#if buyRequestOpen}
            <div id="print-sell-overlay" class="fixed inset-0 bg-black/70 z-50">
                <button
                    id="close-print-info"
                    class="absolute top-6 right-6 text-white text-4xl p-4 z-50 hover:text-red-800 transition"
                    onclick={() => {
                        buyRequestOpen = false;
                    }}
                >
                    &times;
                </button>
                <form
                    onsubmit={(e) => {
                        e.preventDefault();
                        const res = fetch(`/Prints`, {
                            method: "POST",
                            headers: {
                                Accept: "application/json",
                                "Content-type": "application/json",
                            },
                            body: JSON.stringify({
                                print: currentPrint,
                                price: currentPrice,
                                email: email,
                                address: address,
                                message: message,
                            }),
                        });
                        console.log(res);
                        res.then((r) => {
                            let jres = r.json();
                            jres.then((jsonRes) => {
                                if (jsonRes.success) {
                                    buyPageOpen = false;
                                    buyRequestOpen = false;
                                    sentPrint = true;
                                    setTimeout(() => {
                                        sentPrint = false;
                                    }, 5000);
                                } else {
                                    alert("Error Occurred");
                                }
                            });
                        });
                    }}
                    class="bg-slate-800 flex flex-col p-3 rounded-lg mx-[10%] lg:mx-[35%] w-[80%]
                    lg:w-[30%] space-y-1 mt-[25vh]"
                >
                    <div class="text-2xl">Order Details</div>
                    <label
                        >Email:
                        <input
                            required
                            type="email"
                            id="email"
                            bind:value={email}
                        />
                    </label>
                    <label
                        >Address:
                        <input
                            required
                            type="text"
                            id="address"
                            bind:value={address}
                        />
                    </label>
                    <label for="message">Message (optional): </label>
                    <textarea id="message" bind:value={message}></textarea>
                    <input
                        type="submit"
                        value="Send Order"
                        class="bg-red-800 rounded-lg"
                    />
                </form>
            </div>
        {/if}
    {/if}

    {#if sentPrint}
        <div class="mx-auto mt-4 bg-slate-500/70 p-6 text-center">
            Order Sent.
        </div>
    {/if}
</div>
