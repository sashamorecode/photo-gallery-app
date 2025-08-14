<script>
    import Navbar from "$lib/Navbar.svelte";
</script>

<Navbar />
<div class="w-full h-full">
    <h1 class="text-4xl font-cabin font-[400] pl-12 pt-3 pb-4 lg:hidden">
        Contact
    </h1>
    <div
        class="overflow-scroll p-4 max-w-lg m-auto lg:fixed lg:p-8 lg:w-full lg:ml-[25vw]"
    >
        <h1 class="text-4xl mb:text-3xl text-center font-[300]">Message Me</h1>
        <form class="space-y-6 p-4">
            <div>
                <label for="name" class="block text-sm font-medium mb-1"
                    >Name *</label
                >
                <input
                    type="text"
                    id="name"
                    name="name"
                    required
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
    </div>
</div>
