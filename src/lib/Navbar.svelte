<script>
    function openMobileMenu() {
        const navContent = document.getElementById("nav-content");
        navContent.classList.toggle("hidden");
        const icon = this.querySelector("i");
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
    }
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
                <div class="hidden lg:block hover:scale-105 hover:text-red-800">
                    <a href="/">
                        <h1 class="text-3xl">Jonas Schledorn</h1>
                        <h2 class="text-base mb-8 text-gray-600">
                            PHOTOGRAPHER
                        </h2>
                    </a>
                </div>
                <nav class="flex flex-col space-y-2">
                    <a
                        href="/"
                        class="lg:hidden text-red-800 hover:text-red-800 transition"
                        >Home</a
                    >
                    <a
                        href="/Bio"
                        class="text-base hover:text-red-800 transition">Bio</a
                    >
                    <a
                        href="/News"
                        class="text-base hover:text-red-800 transition">News</a
                    >
                    <a
                        href="/Stories"
                        class="text-base hover:text-red-800 transition"
                        >Stories</a
                    >
                    <a
                        href="/Prints"
                        class="text-base hover:text-red-800 transition"
                        >Prints</a
                    >
                    <a
                        href="/Contact"
                        class="text-base hover:text-red-800 transition"
                        >Contact</a
                    >
                </nav>
            </div>
        </div>
        <div class="flex space-x-2 ml-3 lg:block hidden">
            <a href="instagram.com" class="hover:text-gray-300 transition">
                <i class="fab fa-instagram text-xl"></i>
            </a>
            <a href="twitter.com" class="hover:text-gray-300 transition">
                <i class="fab fa-twitter text-xl"></i>
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
