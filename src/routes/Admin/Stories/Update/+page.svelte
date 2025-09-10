<script lang="ts">
    let { data } = $props();
    let stories = $state(data.stories);
    let currentStory = $derived(stories[0]);
    function addImage(): void {
        currentStory.images = [
            ...currentStory.images,
            { src: "", alt: "", title: "" },
        ];
    }

    function removeImage(index: number): void {
        currentStory.images = currentStory.images.filter((_, i) => i !== index);
    }
</script>

<a href="/Admin/Stories/">BACK</a>
<div class="bg-gray-800 mx-auto overflow-y-scroll">
    <p>Select Story Entry</p>
    <select
        class="text-white"
        onchange={(change) => {
            let idx = change.target.selectedOptions[0].id;
            currentStory = stories[idx];
        }}
    >
        {#each stories as news, idx}
            <option class="text-red-400" id={idx}>{news.title}</option>
        {/each}
    </select>
    <form
        onsubmit={(e) => {
            e.preventDefault();
            const res = fetch(`/Admin/Stories/${currentStory.id}`, {
                method: "PUT",
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
                        alert("Updated Entry Sucessfully");
                    } else {
                        alert("Error Occured");
                    }
                });
            });
        }}
        class="grid grid-cols-2 text-xl overflow-y-scroll"
    >
        <div class="flex flex-col">
            <label>
                Story Page URL:
                <input type="text" name="url" bind:value={currentStory.url} />
            </label>
            <label>
                Story Title:
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
            <button type="submit">Update</button>
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
                            bind:value={image.src}
                        />
                    </label>
                    <label>
                        Alt:
                        <input
                            type="text"
                            name={`images[${index}][alt]`}
                            bind:value={image.alt}
                        />
                    </label>
                    <label>
                        Title:
                        <input
                            type="text"
                            name={`images[${index}][title]`}
                            bind:value={image.title}
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
