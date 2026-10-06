<script lang="ts">
    import AdminField from "$lib/components/AdminField.svelte";
    import AdminImageUploader from "$lib/components/AdminImageUploader.svelte";
    import AdminPage from "$lib/components/AdminPage.svelte";
    import AdminSaveBar from "$lib/components/AdminSaveBar.svelte";

    let currentPrint = $state({
        title: "",
        description: "",
        src: "",
        sizes: [{ size: "", price: "" }],
    });
    function addSize(): void {
        currentPrint.sizes.push({ size: "", price: "" });
    }

    function removeSize(index: number): void {
        currentPrint.sizes = currentPrint.sizes.filter((_, i) => i !== index);
    }
</script>

<AdminPage
    backHref="/Admin/Prints/"
    title="Create Print"
    description="Add a new print with a title, description, image, and pricing sizes."
>
    <form
        class="mt-6 flex flex-col gap-6"
        onsubmit={(e) => {
            e.preventDefault();
            const res = fetch(`/Admin/Prints/Create`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(currentPrint),
            });

            res.then((r) => {
                let jres = r.json();
                jres.then((jsonRes) => {
                    if (jsonRes.success) {
                        alert("Entry Successfully");
                        currentPrint.title = "";
                        currentPrint.description = "";
                        currentPrint.src = "";
                        currentPrint.sizes = [{ size: "", price: "" }];
                    } else {
                        alert("Error Occurred");
                    }
                });
            });
        }}
    >
        <AdminField label="Print Title" bind:value={currentPrint.title} />
        <AdminField
            label="Print Description"
            bind:value={currentPrint.description}
        />

        <AdminImageUploader
            label="Print Image"
            value={currentPrint.src}
            setValue={(nextValue) => {
                currentPrint.src = nextValue;
            }}
        />

        <div class="flex flex-col gap-3">
            <h3 class="text-lg font-medium text-gray-200">Sizes</h3>
            {#each currentPrint.sizes as size, index}
                <div
                    class="flex flex-col gap-3 rounded-xl border border-gray-700 bg-gray-900 p-3 sm:flex-row sm:items-end"
                >
                    <div class="min-w-0 flex-1">
                        <AdminField label="Size" bind:value={size.size} />
                    </div>
                    <div class="min-w-0 flex-1">
                        <AdminField label="Price" bind:value={size.price} />
                    </div>
                    <button
                        type="button"
                        onclick={() => removeSize(index)}
                        class="w-full shrink-0 whitespace-nowrap rounded-md bg-red-600 px-3 py-2 text-sm transition hover:bg-red-500 sm:w-auto"
                    >
                        Remove
                    </button>
                </div>
            {/each}

            <button
                type="button"
                onclick={addSize}
                class="w-full rounded-xl border border-dashed border-gray-600 py-3 text-gray-300 transition hover:border-gray-400 hover:text-white"
            >
                + Add Size
            </button>
        </div>

        <AdminSaveBar label="Submit" />
    </form>
</AdminPage>
