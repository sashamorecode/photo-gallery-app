<script>
    let { data } = $props();
    let curStories = data.stories;
</script>

<a href="/Admin/Stories/">BACK</a>
<div class="w-full flex flex-col text-center text-3xl">
    {#each curStories as story}
        <div>
            Title: {story.title}
            <button
                class="bg-red-600 p-2 rounded-lg"
                aria-label="Mark as complete"
                onclick={async (e) => {
                    const res = await fetch(`/Admin/Stories/${story.id}`, {
                        method: "DELETE",
                    });
                    window.location.reload();
                }}
                >DELETE
            </button>
        </div>
    {:else}
        No Stories
    {/each}
</div>
