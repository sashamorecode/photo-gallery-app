<script lang="ts">
    let { saving = false, saved = false, label = "Save changes" } = $props<{
        saving?: boolean;
        saved?: boolean;
        label?: string;
    }>();
</script>

<div
    class="sticky bottom-0 z-20 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-gray-800 bg-gray-950/95 px-4 py-4 backdrop-blur"
    style="padding-bottom: calc(1rem + env(safe-area-inset-bottom));"
>
    {#if saved}
        <span class="text-sm text-emerald-400">Changes saved</span>
    {/if}
    <button
        type="submit"
        disabled={saving}
        class="shrink-0 whitespace-nowrap rounded-lg bg-amber-400 px-5 py-2 font-medium text-gray-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
        {saving ? "Saving…" : label}
    </button>
</div>
