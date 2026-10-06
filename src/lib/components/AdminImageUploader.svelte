<script lang="ts">
    import AdminImageUploadField from "./AdminImageUploadField.svelte";

    let {
        value = "",
        label = "Image",
        setValue,
        onChange,
        heightClass = "h-44",
    } = $props<{
        value?: string;
        label?: string;
        setValue?: (nextValue: string) => void;
        onChange?: () => void;
        heightClass?: string;
    }>();

    function handleSetValue(nextValue: string) {
        setValue?.(nextValue);
        onChange?.();
    }
</script>

<div class="flex flex-col gap-1.5">
    {#if label}
        <span class="text-sm font-medium text-gray-300">{label}</span>
    {/if}

    <div class="overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
        <div class="relative">
            {#if value}
                <img
                    src={value}
                    alt={label}
                    class="w-full {heightClass} object-cover"
                    loading="lazy"
                    draggable="false"
                />
            {:else}
                <div
                    class="flex w-full {heightClass} items-center justify-center text-sm text-gray-500"
                >
                    No image selected
                </div>
            {/if}
        </div>

        <div class="p-3">
            <AdminImageUploadField
                variant="compact"
                {label}
                {value}
                setValue={handleSetValue}
            />
        </div>
    </div>
</div>
