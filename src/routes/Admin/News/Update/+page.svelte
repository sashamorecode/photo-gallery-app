<script lang="ts">
    let { data } = $props();
    let newsPosts = $state(data.news);
    let currentNews = $derived(newsPosts[0]);
    function addImage(): void {
        currentNews.images = [
            ...currentNews.images,
            { src: "", alt: "", title: "" },
        ];
    }

    function removeImage(index: number): void {
        currentNews.images = currentNews.images.filter((_, i) => i !== index);
    }
</script>

<a href="/Admin/News/">BACK</a>
<div class="bg-gray-800 mx-auto overflow-y-scroll">
    <p>Select News Entry</p>
    <select
        class="text-white"
        onchange={(change) => {
            let idx = change.target.selectedOptions[0].id;
            currentNews = newsPosts[idx];
        }}
    >
        {#each newsPosts as news, idx}
            <option class="text-red-400" id={idx}>{news.title}</option>
        {/each}
    </select>
    <form
        onsubmit={(e) => {
            e.preventDefault();
            const res = fetch(`/Admin/News/${currentNews.id}`, {
                method: "PUT",
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
                News Page URL:
                <input type="text" name="url" bind:value={currentNews.url} />
            </label>
            <label>
                News Title:
                <input
                    type="text"
                    name="title"
                    bind:value={currentNews.title}
                />
            </label>
            <label>
                Cover Image Src:
                <input
                    type="text"
                    name="coverImage"
                    bind:value={currentNews.coverImage}
                />
            </label>
            <label>
                Date Of Publication:
                <input
                    type="text"
                    placeholder="15 - Mar - 2021"
                    name="date"
                    bind:value={currentNews.date}
                />
            </label>
            <label>
                News Type:
                <input
                    type="text"
                    name="newsType"
                    bind:value={currentNews.newsType}
                />
            </label>
            <label>
                News Content:
                <textarea name="content" bind:value={currentNews.content}
                ></textarea>
            </label>
            <button type="submit">Update</button>
        </div>
        <div class="flex flex-col">
            <h3>Images</h3>
            {#each currentNews.images as image, index}
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
