<script lang="ts">
    import AdminField from "$lib/components/AdminField.svelte";
    import AdminImageGrid from "$lib/components/AdminImageGrid.svelte";
    import AdminImageUploader from "$lib/components/AdminImageUploader.svelte";
    import AdminPage from "$lib/components/AdminPage.svelte";
    import AdminSaveBar from "$lib/components/AdminSaveBar.svelte";

    let { data } = $props();
    let newsPosts = $state(data.news);
    let currentNews = $derived(newsPosts[0]);
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
            const response = await fetch(`/Admin/News/${currentNews.id}`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(currentNews),
            });
            const result = await response.json();

            if (result.success) {
                saved = true;
            } else {
                alert("Error Occured");
            }
        } catch (error) {
            alert("Error Occured");
        } finally {
            saving = false;
        }
    }
</script>

<AdminPage
    backHref="/Admin/News/"
    title="Edit News Post"
    description="Choose a post to edit, update its details and images, then save your changes."
>
{#if currentNews}
    <div class="mt-6 flex flex-col gap-1.5">
        <span class="text-sm font-medium text-gray-300">Select News Entry</span>
        <select
            class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-base text-gray-100"
            onchange={(event) => {
                const target = event.target as HTMLSelectElement;
                const idx = Number(target.value);
                currentNews = newsPosts[idx];
            }}
        >
            {#each newsPosts as news, idx}
                <option value={idx}>{news.title}</option>
            {/each}
        </select>
    </div>

    <form onsubmit={handleSubmit} class="mt-6 flex flex-col gap-6">
        <AdminField label="News Page URL" bind:value={currentNews.url} />
        <AdminField label="News Title" bind:value={currentNews.title} />

        <AdminImageUploader
            label="Cover Image"
            value={currentNews.coverImage}
            setValue={(nextValue) => {
                currentNews.coverImage = nextValue;
            }}
            onChange={() => (saved = false)}
        />

        <AdminField
            label="Date Of Publication"
            bind:value={currentNews.date}
            placeholder="15 - Mar - 2021"
        />
        <AdminField label="News Type" bind:value={currentNews.newsType} />
        <AdminField
            label="News Content"
            bind:value={currentNews.content}
            multiline
            rows={10}
        />

        <h2 class="mt-8 text-lg font-medium">Images</h2>
        <AdminImageGrid
            images={currentNews.images}
            showMeta
            addLabel="+ Add image"
            onChange={() => (saved = false)}
        />

        <AdminSaveBar {saving} {saved} />
    </form>
{:else}
    <div
        class="mt-6 rounded-xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400"
    >
        No news posts yet. Create one from the
        <a class="text-amber-300 underline" href="/Admin/News/Create"
            >create page</a
        >.
    </div>
{/if}
</AdminPage>
