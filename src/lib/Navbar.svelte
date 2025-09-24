<script>
    import { page } from "$app/state";
    function openMobileMenu() {
        const navContent = document.getElementById("nav-content");
        navContent.classList.toggle("hidden");
        const icon = this.querySelector("i");
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
    }

    var links = ["Bio", "News", "Stories", "Prints", "Contact"];
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
            <i class="fas fa-bars text-2xl"></i>
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
                class="hover:text-gray-300 transition"
            >
                <i class="fab fa-instagram text-xl"></i>
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
