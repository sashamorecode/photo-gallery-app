<script>
    let { data } = $props();
    let curNews = data.news;
</script>

<a href="/Admin/News/">BACK</a>
<div class="w-full flex flex-col text-center text-3xl">
    {#each curNews as news}
        <div>
            Title: {news.title}
            <button
                class="bg-red-600 p-2 rounded-lg"
                aria-label="Mark as complete"
                onclick={async (e) => {
                    const res = await fetch(`/Admin/News/${news.id}`, {
                        method: "DELETE",
                    });
                    window.location.reload();
                }}
                >DELETE
            </button>
        </div>
    {:else}
        No News
    {/each}
</div>
