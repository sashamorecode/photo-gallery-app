<script lang="ts">
    import AdminField from "$lib/components/AdminField.svelte";
    import AdminImageUploader from "$lib/components/AdminImageUploader.svelte";
    import AdminPage from "$lib/components/AdminPage.svelte";
    import AdminSaveBar from "$lib/components/AdminSaveBar.svelte";

    let { data } = $props();
    let prints = $state(data.prints);
    let currentPrint = $derived(prints[0]);
    let saving = $state(false);
    let saved = $state(false);

    function addSize(): void {
        currentPrint.sizes = [...currentPrint.sizes, { size: "", price: "" }];
    }
    function removeSize(index: number): void {
        currentPrint.sizes = currentPrint.sizes.filter(
            (_: unknown, i: number) => i !== index,
        );
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (saving) {
            return;
        }

        saving = true;
        saved = false;

        try {
            const response = await fetch(`/Admin/Prints/${currentPrint.id}`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(currentPrint),
            });
            const jsonRes = await response.json();

            if (jsonRes.success) {
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
    backHref="/Admin/Prints/"
    title="Edit Print"
    description="Select a print, then update its title, description, image, and pricing sizes."
>
{#if currentPrint}
    <div class="mt-6">
        <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-gray-300">Select Print Entry</span>
            <select
                class="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-base text-gray-100"
                onchange={(event) => {
                    const target = event.target as HTMLSelectElement;
                    const idx = Number(target.value);
                    currentPrint = prints[idx];
                    saved = false;
                }}
            >
                {#each prints as print, idx}
                    <option value={idx}>{print.title}</option>
                {/each}
            </select>
        </label>

        <form onsubmit={handleSubmit} class="mt-6 flex flex-col gap-6">
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
                onChange={() => (saved = false)}
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

            <AdminSaveBar {saving} {saved} />
        </form>
    </div>
{:else}
    <div
        class="mt-6 rounded-xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400"
    >
        No prints yet. Create one from the
        <a class="text-amber-300 underline" href="/Admin/Prints/Create"
            >create page</a
        >.
    </div>
{/if}
</AdminPage>
