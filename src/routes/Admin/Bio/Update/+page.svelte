<script lang="ts">
    import AdminField from "$lib/components/AdminField.svelte";
    import AdminImageUploader from "$lib/components/AdminImageUploader.svelte";
    import AdminPage from "$lib/components/AdminPage.svelte";
    import AdminSaveBar from "$lib/components/AdminSaveBar.svelte";

    let { data } = $props();

    let bio = $state({ ...data.bio });
    let saving = $state(false);
    let saved = $state(false);

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (saving) {
            return;
        }

        saving = true;
        saved = false;

        try {
            const response = await fetch("/Admin/Bio", {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(bio),
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error ?? "Update failed");
            }

            saved = true;
        } catch (error) {
            alert(error instanceof Error ? error.message : "Error occurred");
        } finally {
            saving = false;
        }
    }
</script>

<AdminPage
    backHref="/Admin/"
    title="Modify Bio"
    description="Update the portrait and the biography text shown on the Bio page."
    maxWidthClass="max-w-3xl"
>
    <form onsubmit={handleSubmit} class="mt-6 flex flex-col gap-6">
        <AdminImageUploader
            label="Portrait Image"
            value={bio.image}
            setValue={(nextValue) => {
                bio.image = nextValue;
            }}
            onChange={() => (saved = false)}
        />

        <AdminField
            label="Biography Text"
            bind:value={bio.text}
            multiline
            rows={10}
            placeholder="Write the biography..."
        />

        <AdminSaveBar {saving} {saved} />
    </form>
</AdminPage>
