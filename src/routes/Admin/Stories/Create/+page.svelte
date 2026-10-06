<script lang="ts">
    import AdminField from "$lib/components/AdminField.svelte";
    import AdminImageGrid from "$lib/components/AdminImageGrid.svelte";
    import AdminImageUploader from "$lib/components/AdminImageUploader.svelte";
    import AdminPage from "$lib/components/AdminPage.svelte";
    import AdminSaveBar from "$lib/components/AdminSaveBar.svelte";

    const currentStory = $state({
        url: "",
        title: "",
        coverImage: "",
        images: [{ src: "", alt: "", title: "" }],
    });
</script>

<AdminPage
    backHref="/Admin/Stories/"
    title="Create Story"
    description="Add a new story with a cover image and an ordered set of images."
>
    <form
        class="mt-6 flex flex-col gap-6"
        onsubmit={(e) => {
            e.preventDefault();
            const res = fetch(`/Admin/Stories/Create`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(currentStory),
            });

            res.then((r) => {
                let jres = r.json();
                jres.then((jsonRes) => {
                    if (jsonRes.success) {
                        alert("Entry Successfully");
                        currentStory.url = "";
                        currentStory.title = "";
                        currentStory.coverImage = "";
                        currentStory.images = [{ src: "", alt: "", title: "" }];
                    } else {
                        alert("Error Occurred");
                    }
                });
            });
        }}
    >
        <AdminField label="Stories Page URL" bind:value={currentStory.url} />
        <AdminField label="Stories Title" bind:value={currentStory.title} />

        <AdminImageUploader
            label="Cover Image"
            value={currentStory.coverImage}
            setValue={(nextValue) => {
                currentStory.coverImage = nextValue;
            }}
        />

        <h2 class="mt-8 text-lg font-medium">Images</h2>
        <AdminImageGrid
            images={currentStory.images}
            showMeta
            addLabel="+ Add image"
        />

        <AdminSaveBar label="Submit" />
    </form>
</AdminPage>
