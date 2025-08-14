<script>
    let { data } = $props();
    let curPrints = data.prints;
</script>

<a href="/Admin/Prints/">BACK</a>
<div class="w-full flex flex-col text-center text-3xl">
    {#each curPrints as print}
        <div>
            Title: {print.title}
            <button
                class="bg-red-600 p-2 rounded-lg"
                aria-label="Mark as complete"
                onclick={async (e) => {
                    const res = await fetch(`/Admin/Prints/${print.id}`, {
                        method: "DELETE",
                    });
                    window.location.reload();
                }}
                >DELETE
            </button>
        </div>
    {:else}
        No Prints
    {/each}
</div>
