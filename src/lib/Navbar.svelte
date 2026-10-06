<script>
    import { page } from "$app/state";
    function openMobileMenu() {
        document.getElementById("nav-content")?.classList.toggle("hidden");
        document.getElementById("icon-bars")?.classList.toggle("hidden");
        document.getElementById("icon-times")?.classList.toggle("hidden");
    }

    var links = ["Bio", "News", "Stories", "Contact"];
</script>

<!-- Mobile menu button (hidden on desktop) -->
<div>
    <div
        class="lg:hidden flex justify-end mb-4 top-[1em] left-[1em] z-10 position: absolute"
    >
        <button
            id="mobile-menu-button"
            class="text-white focus:outline-none"
            aria-label="mobile menu"
            onclick={openMobileMenu}
        >
            <svg id="icon-bars" class="text-2xl" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" style="height:1em;width:auto;vertical-align:-.125em;"><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>
            <svg id="icon-times" class="text-2xl hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" style="height:1em;width:auto;vertical-align:-.125em;"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
        </button>
    </div>
    <!-- Left sidebar -->
    <div class="p-0 lg:p-8 flex flex-col justify-between h-full">
        <div id="nav-content" class="flex-grow lg:block hidden w-[30%]">
            <div>
                <a href="/">
                    <div
                        class="hidden lg:block hover:scale-105 hover:text-red-800"
                    >
                        <h1 class="text-3xl">Jonas Schledorn</h1>
                        <h2 class="text-base mb-8 text-gray-600">
                            PHOTOGRAPHER
                        </h2>
                    </div>
                </a>
                <nav class="flex flex-col space-y-2">
                    <a
                        href="/"
                        class="lg:hidden text-red-800 hover:text-red-800 transition"
                        data-sveltekit-preload-data
                        >Home</a
                    >
                    {#each links as link}
                        {#if link[1] === page.url.pathname[2]}
                            <a
                                href={"/" + link}
                                class="text-base font-semibold hover:text-red-800 transition"
                                >{link}</a
                            >
                        {:else}
                            <a
                                href={"/" + link}
                                class="text-base hover:text-red-800 hover:font-semibold transition"
                                >{link}</a
                            >
                        {/if}
                    {/each}
                </nav>
            </div>
        </div>
        <div class="flex space-x-2 ml-3 lg:block hidden">
            <a
                href="https://www.instagram.com/jonasschledorn"
                target="_blank"
                aria-label="Instagram"
                class="hover:text-gray-300 transition"
            >
                <svg class="text-xl" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" style="height:1em;width:auto;vertical-align:-.125em;"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
            </a>
        </div>
    </div>
</div>

<style>
    #nav-content {
        transition: all 0.3s ease;
    }

    /* Ensure mobile menu appears above content */
    @media (max-width: 1023px) {
        #nav-content {
            position: absolute;
            left: 0;
            top: 3em;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 100;
            padding: 20px;
            border-radius: 20px;
        }

        #nav-content nav {
            padding-bottom: 20px;
        }
    }
</style>
