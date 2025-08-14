<script>
    import Navbar from "$lib/Navbar.svelte";
    import NewsEntry from "$lib/NewsEntry.svelte";
    let { data } = $props();
    const entries = data.news;
    console.log(entries)
</script>

<Navbar />

<div class="w-full h-full overflow-y-auto lg:pl-4 lg:p-4">
    <h1
        class="text-4xl font-cabin font-[400] pl-12 pt-3 pb-3 absolute w-full bg-black pb-4 lg:hidden"
    >
        News
    </h1>
    <div class="pt-20 lg:pt-4 p-4">
        <!-- News Grid -->
        <div id="news-grid" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- News Item 1 -->
            {#each entries as { coverImage, title, date, url, newsType }}
                <NewsEntry
                    {coverImage}
                    newsTitle={title}
                    {newsType}
                    newsDate={date}
                    newsUrl={url}
                />
            {/each}
        </div>

        <!-- News Detail View (hidden by default) -->
        <div id="news-detail" class="hidden mt-8">
            <button
                id="back-button"
                class="mb-6 flex items-center text-red-800 hover:text-red-300 transition"
            >
                <i class="fas fa-arrow-left mr-2"></i> Back to News
            </button>

            <div class="lg:flex gap-8">
                <!-- Images Grid -->
                <div class="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="image-item cursor-pointer" data-index="0">
                        <img
                            src=""
                            alt=""
                            class="w-full h-64 object-cover rounded-lg"
                        />
                    </div>
                    <div class="image-item cursor-pointer" data-index="1">
                        <img
                            src=""
                            alt=""
                            class="w-full h-64 object-cover rounded-lg"
                        />
                    </div>
                    <div class="image-item cursor-pointer" data-index="2">
                        <img
                            src=""
                            alt=""
                            class="w-full h-64 object-cover rounded-lg"
                        />
                    </div>
                    <div class="image-item cursor-pointer" data-index="3">
                        <img
                            src=""
                            alt=""
                            class="w-full h-64 object-cover rounded-lg"
                        />
                    </div>
                </div>

                <!-- Text Content -->
                <div class="lg:w-1/3 mt-6 lg:mt-0">
                    <h2 id="detail-title" class="text-2xl font-cabin mb-4"></h2>
                    <div
                        id="detail-content"
                        class="text-gray-300 space-y-4"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
</style>
