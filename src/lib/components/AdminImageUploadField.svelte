<script lang="ts">
    import { uploadImageFile } from "$lib/admin/uploadClient";

    let {
        value = "",
        label = "Image Src",
        setValue,
    } = $props<{
        value?: string;
        label?: string;
        setValue?: (nextValue: string) => void;
    }>();

    let isUploading = $state(false);
    let uploadError = $state("");

    function updateValue(nextValue: string) {
        value = nextValue;
        setValue?.(nextValue);
    }

    async function handleFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const selectedFile = target.files?.[0] ?? null;

        if (!selectedFile || isUploading) {
            return;
        }

        uploadError = "";
        isUploading = true;

        try {
            const uploadedPath = await uploadImageFile(selectedFile);
            updateValue(uploadedPath);
            target.value = "";
        } catch (error) {
            uploadError =
                error instanceof Error ? error.message : "Failed to upload image";
        } finally {
            isUploading = false;
        }
    }
</script>

<p class="upload-label">{label}:</p>
<div class="upload-controls">
    <input
        type="file"
        accept="image/*"
        onchange={handleFileChange}
        disabled={isUploading}
    />
    {#if isUploading}
        <span>Uploading...</span>
    {/if}
</div>
{#if value}
    <div class="preview-row">
        <img src={value} alt={label} class="preview-image" loading="lazy" />
    </div>
{/if}
{#if uploadError}
    <p class="upload-error">{uploadError}</p>
{/if}

<style>
    .upload-label {
        margin-bottom: 0.25rem;
        display: block;
    }

    .upload-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.35rem;
    }

    .preview-row {
        margin-bottom: 0.75rem;
    }

    .preview-image {
        width: 88px;
        height: 88px;
        object-fit: contain;
        border-radius: 0.375rem;
        border: 1px solid #4b5563;
        background: #111827;
        display: block;
    }

    .upload-error {
        color: #f87171;
        margin-top: -0.25rem;
        margin-bottom: 0.75rem;
    }
</style>
