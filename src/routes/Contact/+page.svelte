<script>
    import Navbar from "$lib/Navbar.svelte";
    let currentForm = {
        name: "",
        email: "",
        phone: "",
        message: "",
    };
    let messageSent = false;
</script>

<Navbar />
<div class="w-full h-full lg:my-14">
    <h1 class="text-4xl font-cabin font-[400] pl-12 pt-3 pb-4 lg:hidden">
        Contact
    </h1>
    <div
        class="overflow-scroll p-4 max-w-lg m-auto lg:fixed lg:p-8 lg:w-full lg:ml-[25%]"
    >
        <h1 class="text-4xl mb:text-3xl text-center font-[300] pb-4">
            Message Me
        </h1>
        <form
            onsubmit={(e) => {
                e.preventDefault();
                const res = fetch(`/Contact`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-type": "application/json",
                    },
                    body: JSON.stringify(currentForm),
                });
                res.then((r) => {
                    let jres = r.json();
                    jres.then((jsonRes) => {
                        if (jsonRes.success) {
                            currentForm.name = "";
                            currentForm.email = "";
                            currentForm.message = "";
                            currentForm.phone = "";
                            messageSent = true;
                            setTimeout(() => {
                                messageSent = false;
                            }, 5000);
                        } else {
                            alert("Error Occurred");
                        }
                    });
                });
            }}
            class="space-y-6 p-4"
        >
            <div>
                <label for="name" class="block text-sm font-medium mb-1"
                    >Name *</label
                >
                <input
                    type="text"
                    id="name"
                    name="name"
                    bind:value={currentForm.name}
                    class="w-full px-4 py-2 bg-gray-600 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-red-800"
                />
            </div>

            <div>
                <label for="email" class="block text-sm font-medium mb-1"
                    >Email *</label
                >
                <input
                    type="email"
                    id="email"
                    name="email"
                    bind:value={currentForm.email}
                    required
                    class="w-full px-4 py-2 bg-gray-600 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-red-800"
                />
            </div>

            <div>
                <label for="phone" class="block text-sm font-medium mb-1"
                    >Phone (optional)</label
                >
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    bind:value={currentForm.phone}
                    class="w-full px-4 py-2 bg-gray-600 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-red-800"
                />
            </div>

            <div>
                <label for="message" class="block text-sm font-medium mb-1"
                    >Message *</label
                >
                <textarea
                    id="message"
                    name="message"
                    rows="4"
                    bind:value={currentForm.message}
                    required
                    class="w-full px-4 py-2 bg-gray-600 border border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-red-800"
                ></textarea>
            </div>

            <button
                type="submit"
                class="w-full py-2 px-4 bg-red-800 hover:bg-red-700 text-white font-medium rounded transition duration-300"
            >
                Send Message
            </button>
        </form>
        {#if messageSent}
            <div class="mx-auto mt-4 bg-slate-500/70 p-6 text-center">
                Message Sent!
            </div>
        {/if}
    </div>
</div>
