<script>
    import Navbar from "$lib/Navbar.svelte";
</script>

<div
    class="flex h-screen bg-black text-white overflow-hidden font-amiko font-[400]"
>
    <Navbar />
    <div class="w-full h-full lg:pl-4 lg:p-8 overflow-scroll">
        <h1
            class="text-4xl font-cabin font-[400] text-center pt-3 pb-3 absolute w-full bg-black lg:hidden"
        >
            Privacy Policy
        </h1>
        <div class="overflow-hidden p-4 pt-16 lg:pt-0 lg:pr-4">
            <h1 class="text-3xl text-center font-[300] pb-4 lg:text-left">
                Privacy Policy
            </h1>
            <p class="text-sm text-gray-500 pb-6">
                Last updated: September 30, 2026
            </p>
            <div class="max-w-2xl space-y-6 text-gray-300 leading-relaxed">
                <p>
                    This is the photography portfolio of Jonas Schledorn. I keep
                    data collection to an absolute minimum.
                </p>

                <section>
                    <h2 class="text-xl font-semibold text-white pb-2">
                        Analytics
                    </h2>
                    <p>
                        This site uses Umami, a self-hosted analytics tool that
                        runs on my own server. Umami does not use cookies and
                        does not collect personal data. It records only
                        anonymous, aggregate statistics such as pages visited,
                        approximate country, device type, and browser.
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-white pb-2">
                        Third-party resources
                    </h2>
                    <p>
                        Icons and a stylesheet are loaded from external content
                        delivery networks (Font Awesome and Tailwind CSS, hosted
                        on Cloudflare). Loading these resources may transmit
                        your IP address and browser details to the provider.
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-white pb-2">
                        Your data
                    </h2>
                    <p>
                        I do not collect, store, or sell any personal data
                        through this website, and no personal data is shared
                        with third parties. Because no personal data is
                        collected, there is nothing to access, correct, or
                        delete.
                    </p>
                </section>

                <section>
                    <h2 class="text-xl font-semibold text-white pb-2">
                        Contact
                    </h2>
                    <p>
                        For any privacy questions, contact:
                        <a
                            href="mailto:sashasalzweir@gmail.com"
                            class="text-red-800 hover:text-red-700"
                            >sashasalzweir@gmail.com</a
                        >
                    </p>
                </section>
            </div>
        </div>
    </div>
</div>
