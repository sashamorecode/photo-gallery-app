<script lang="ts">
    const currentNews = $state({
        url: "",
        title: "",
        coverImage: "",
        date: "",
        newsType: "",
        images: [{ src: "", alt: "", title: "" }],
        content: "",
    });

    function addImage(): void {
        currentNews.images.push({ src: "", alt: "", title: "" });
    }

    function removeImage(index: number): void {
        currentNews.images = currentNews.images.filter((_, i) => i !== index);
    }
</script>

<a href="/Admin/News/">BACK</a>
<div class="bg-gray-800 mx-auto overflow-y-scroll">
    <form
        class="grid grid-cols-2 text-xl overflow-y-scroll"
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
                        currentNews.images = [{ src: "", alt: "", title: "" }];
                    } else {
                        alert("Error Occurred");
                    }
                });
            });
        }}
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
            <button type="submit">Submit</button>
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
                            bind:value={currentNews.images[index].src}
                        />
                    </label>
                    <label>
                        Alt:
                        <input
                            type="text"
                            name={`images[${index}][alt]`}
                            bind:value={currentNews.images[index].alt}
                        />
                    </label>
                    <label>
                        Title:
                        <input
                            type="text"
                            name={`images[${index}][title]`}
                            bind:value={currentNews.images[index].title}
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
