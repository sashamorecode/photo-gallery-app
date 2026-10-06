<script lang="ts">
    let {
        label,
        value = $bindable(""),
        type = "text",
        placeholder = "",
        multiline = false,
        rows = 4,
    } = $props<{
        label: string;
        value?: string;
        type?: string;
        placeholder?: string;
        multiline?: boolean;
        rows?: number;
    }>();

    const fieldClass =
        "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-base text-gray-100 outline-none transition focus:border-amber-400";
</script>

<label class="flex flex-col gap-1.5">
    <span class="text-sm font-medium text-gray-300">{label}</span>
    {#if multiline}
        <textarea
            bind:value
            {rows}
            {placeholder}
            class={fieldClass}
        ></textarea>
    {:else}
        <input {type} bind:value {placeholder} class={fieldClass} />
    {/if}
</label>
