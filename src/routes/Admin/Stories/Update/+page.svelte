<script lang="ts">
    import AdminField from "$lib/components/AdminField.svelte";
    import AdminImageGrid from "$lib/components/AdminImageGrid.svelte";
    import AdminImageUploader from "$lib/components/AdminImageUploader.svelte";
    import AdminPage from "$lib/components/AdminPage.svelte";
    import AdminSaveBar from "$lib/components/AdminSaveBar.svelte";

    let { data } = $props();
    let stories = $state(data.stories);
    let currentStory = $derived(stories[0]);
    let saving = $state(false);
    let saved = $state(false);

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (saving) {
            return;
        }

        saving = true;
        saved = false;

        try {
            const res = await fetch(`/Admin/Stories/${currentStory.id}`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(currentStory),
            });
            const jsonRes = await res.json();

            if (jsonRes.success) {
                saved = true;
            } else {
                alert("Error Occured");
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : "Error Occured");
        } finally {
            saving = false;
        }
    }
</script>

<AdminPage
    backHref="/Admin/Stories/"
    title="Edit Story"
    description="Select a story, then update its details, cover image and images."
>
{#if currentStory}
    <div class="mt-6 flex flex-col gap-6">
        <p class="text-sm font-medium text-gray-300">Select Story Entry</p>
        <select
            class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-base text-gray-100"
            onchange={(event) => {
                const target = event.target as HTMLSelectElement;
                const idx = Number(target.value);
                currentStory = stories[idx];
            }}
        >
            {#each stories as news, idx}
                <option class="text-red-400" value={idx}>{news.title}</option>
            {/each}
        </select>

        <form class="flex flex-col gap-6" onsubmit={handleSubmit}>
            <AdminField label="Story Page URL" bind:value={currentStory.url} />
            <AdminField label="Story Title" bind:value={currentStory.title} />

            <AdminImageUploader
                label="Cover Image"
                value={currentStory.coverImage}
                setValue={(nextValue) => {
                    currentStory.coverImage = nextValue;
                }}
                onChange={() => (saved = false)}
            />

            <h2 class="mt-8 text-lg font-medium">Images</h2>
            <AdminImageGrid
                images={currentStory.images}
                onChange={() => (saved = false)}
                showMeta
                addLabel="+ Add image"
            />

            <AdminSaveBar {saving} {saved} />
        </form>
    </div>
{:else}
    <div
        class="mt-6 rounded-xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400"
    >
        No stories yet. Create one from the
        <a class="text-amber-300 underline" href="/Admin/Stories/Create"
            >create page</a
        >.
    </div>
{/if}
</AdminPage>
