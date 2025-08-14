<script lang="ts">
    type ImageData = {
        src: string;
        alt: string;
        title: string;
    };

    let images: ImageData[] = [{ src: "", alt: "", title: "" }];

    function addImage(): void {
        images = [...images, { src: "", alt: "", title: "" }];
    }

    function removeImage(index: number): void {
        images = images.filter((_, i) => i !== index);
    }
</script>

<a href="/Admin/News/">BACK</a>
<div class="bg-gray-800 mx-auto overflow-y-scroll">
    <form
        action="/Admin/News/Create"
        method="POST"
        enctype="multipart/form-data"
        class="grid grid-cols-2 text-xl overflow-y-scroll"
    >
        <div class="flex flex-col">
            <label>
                News Page URL:
                <input type="text" name="url" />
            </label>
            <label>
                News Title:
                <input type="text" name="title" />
            </label>
            <label>
                Cover Image Src:
                <input type="text" name="coverImage" />
            </label>
            <label>
                Date Of Publication:
                <input type="text" placeholder="15 - Mar - 2021" name="date" />
            </label>
            <label>
                News Type:
                <input type="text" name="newsType" />
            </label>
            <label>
                News Content:
                <textarea name="content"></textarea>
            </label>
            <button type="submit">Submit</button>
        </div>
        <div class="flex flex-col">
            <h3>Images</h3>
            {#each images as image, index}
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
                    <button type="button" class="bg-red-500 rounded-lg p-1" on:click={() => removeImage(index)}
                        >Remove</button
                    >
                </div>
            {/each}

            <button type="button" on:click={addImage}>+ Add Image</button>
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
