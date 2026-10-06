<script lang="ts">
    import AdminField from "$lib/components/AdminField.svelte";
    import AdminImageGrid from "$lib/components/AdminImageGrid.svelte";
    import AdminImageUploader from "$lib/components/AdminImageUploader.svelte";
    import AdminPage from "$lib/components/AdminPage.svelte";
    import AdminSaveBar from "$lib/components/AdminSaveBar.svelte";

    const currentNews = $state({
        url: "",
        title: "",
        coverImage: "",
        date: "",
        newsType: "",
        images: [{ src: "", alt: "", title: "" }],
        content: "",
    });
</script>

<AdminPage
    backHref="/Admin/News/"
    title="Create News Post"
    description="Fill in the details below and add any images that should appear with the post."
>
    <form
        class="mt-6 flex flex-col gap-6"
        onsubmit={(e) => {
            e.preventDefault();
            const res = fetch(`/Admin/News/Create`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(currentNews),
            });

            res.then((r) => {
                let jres = r.json();
                jres.then((jsonRes) => {
                    if (jsonRes.success) {
                        alert("Entry Successfully");
                        currentNews.url = "";
                        currentNews.title = "";
                        currentNews.coverImage = "";
                        currentNews.date = "";
                        currentNews.content = "";
                        currentNews.newsType = "";
                        currentNews.images = [
                            { src: "", alt: "", title: "" },
                        ];
                    } else {
                        alert("Error Occurred");
                    }
                });
            });
        }}
    >
        <AdminField label="News Page URL" bind:value={currentNews.url} />
        <AdminField label="News Title" bind:value={currentNews.title} />

        <AdminImageUploader
            label="Cover Image"
            value={currentNews.coverImage}
            setValue={(nextValue) => {
                currentNews.coverImage = nextValue;
            }}
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
        />

        <AdminSaveBar label="Submit" />
    </form>
</AdminPage>
