<script lang="ts">
    import AdminImageUploadField from "$lib/components/AdminImageUploadField.svelte";

    let { data } = $props();
    let images = $state(data.images);
    function addImage(): void {
        images = [...images, { src: "" }];
    }

    function removeImage(index: number): void {
        images = images.filter((_: unknown, i: number) => i !== index);
    }
</script>

<a href="/Admin/Homepage/">BACK</a>
<div class="bg-gray-800 mx-auto overflow-y-scroll w-[60vw]">
    <form
        onsubmit={(e) => {
            e.preventDefault();
            const res = fetch(`/Admin/Homepage/`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(images),
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
        class="grid grid-row -xl overflow-y-scroll"
    >
        <div class="flex flex-col">
            {#each images as image, index}
                <div
                    style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;"
                >
                    <AdminImageUploadField
                        label="Image"
                        value={image.src}
                        setValue={(nextValue) => {
                            image.src = nextValue;
                        }}
                    />
                    <button
                        type="button"
                        class="bg-red-500 rounded-lg p-1"
                        onclick={() => removeImage(index)}>Remove</button
                    >
                </div>
            {/each}

            <button type="button" onclick={addImage}>+ Add Image</button>
        </div>
        <button type="submit">Update</button>
    </form>
</div>

<style>
    button {
        margin-top: 10px;
    }
</style>
