<script lang="ts">
    type ImageData = {
        src: string;
        alt: string;
        title: string;
    };
    const currentStory = $state({
        url: "",
        title: "",
        coverImage: "",
        images: [{ src: "", alt: "", title: "" }],
    });

    function addImage(): void {
        currentStory.images.push({ src: "", alt: "", title: "" });
    }

    function removeImage(index: number): void {
        currentStory.images = currentStory.images.filter((_, i) => i !== index);
    }
</script>

<a href="/Admin/Stories/">BACK</a>
<div class="bg-gray-800 mx-auto overflow-y-scroll">
    <form
        class="grid grid-cols-2 text-xl overflow-y-scroll"
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
        <div class="flex flex-col">
            <label>
                Stories Page URL:
                <input type="text" name="url" bind:value={currentStory.url} />
            </label>
            <label>
                Stories Title:
                <input
                    type="text"
                    name="title"
                    bind:value={currentStory.title}
                />
            </label>
            <label>
                Cover Image Src:
                <input
                    type="text"
                    name="coverImage"
                    bind:value={currentStory.coverImage}
                />
            </label>
            <button type="submit">Submit</button>
        </div>
        <div class="flex flex-col">
            <h3>Images</h3>
            {#each currentStory.images as image, index}
                <div
                    style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;"
                >
                    <label>
                        Src:
                        <input
                            type="text"
                            name={`images[${index}][src]`}
                            bind:value={currentStory.images[index].src}
                        />
                    </label>
                    <label>
                        Alt:
                        <input
                            type="text"
                            name={`images[${index}][alt]`}
                            bind:value={currentStory.images[index].alt}
                        />
                    </label>
                    <label>
                        Title:
                        <input
                            type="text"
                            name={`images[${index}][title]`}
                            bind:value={currentStory.images[index].title}
                        />
                    </label>
                    <button
                        type="button"
                        class="bg-red-500 rounded-lg p-1"
                        onclick={() => removeImage(index)}>Remove</button
                    >
                </div>
            {/each}

            <button type="button" onclick={addImage}>+ Add Image</button>
        </div>
    </form>
</div>

<style>
    label {
        margin-bottom: 10px;
        display: flex;
        flex-direction: row;
        height: 4em;
        border-width: 1px;
        border-color: gray;
    }
    button {
        margin-top: 10px;
    }
    input,
    textarea {
        width: 100%;
    }
</style>
