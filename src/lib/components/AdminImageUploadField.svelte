<script lang="ts">
    import { uploadImageFile } from "$lib/admin/uploadClient";

    let {
        value = "",
        label = "Image Src",
        setValue,
        variant = "default",
    } = $props<{
        value?: string;
        label?: string;
        setValue?: (nextValue: string) => void;
        variant?: "default" | "compact";
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

{#if variant === "compact"}
    <div class="upload-controls compact-controls">
        <input
            type="file"
            accept="image/*"
            aria-label={label}
            onchange={handleFileChange}
            disabled={isUploading}
            class="compact-input"
        />
        {#if isUploading}
            <span class="compact-status">Uploading...</span>
        {/if}
    </div>
    {#if uploadError}
        <p class="upload-error compact-error">{uploadError}</p>
    {/if}
{:else}
    <p class="upload-label">{label}:</p>
    <div class="upload-controls">
        <input
            type="file"
            accept="image/*"
            aria-label={label}
            onchange={handleFileChange}
            disabled={isUploading}
        />
        {#if isUploading}
            <span>Uploading...</span>
        {/if}
    </div>
    {#if value}
        <div class="preview-row">
            <img
                src={value}
                alt={label}
                class="preview-image"
                loading="lazy"
                draggable="false"
            />
        </div>
    {/if}
    {#if uploadError}
        <p class="upload-error">{uploadError}</p>
    {/if}
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

    .compact-controls {
        margin-bottom: 0;
        min-width: 0;
    }

    .compact-input {
        width: 100%;
        min-width: 0;
        font-size: 1rem;
        color: #9ca3af;
    }

    .compact-input::file-selector-button {
        margin-right: 0.5rem;
        cursor: pointer;
        border: 0;
        border-radius: 0.375rem;
        background: #374151;
        padding: 0.35rem 0.6rem;
        font-size: 0.75rem;
        font-weight: 500;
        color: #f3f4f6;
    }

    .compact-input::file-selector-button:hover {
        background: #4b5563;
    }

    .compact-status {
        flex-shrink: 0;
        font-size: 0.75rem;
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

    .compact-error {
        margin-top: 0.25rem;
        margin-bottom: 0;
        font-size: 0.75rem;
    }
</style>
