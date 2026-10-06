<script lang="ts">
    import type { Snippet } from "svelte";

    let {
        backHref = "/Admin/",
        backLabel = "← Back",
        title = "",
        description = "",
        maxWidthClass = "max-w-4xl",
        children,
    } = $props<{
        backHref?: string;
        backLabel?: string;
        title?: string;
        description?: string;
        maxWidthClass?: string;
        children?: Snippet;
    }>();
</script>

    <div class="h-dvh w-full overflow-y-auto overscroll-contain">
    <div class="mx-auto {maxWidthClass} px-4 py-8 text-gray-100">
        <a
            href={backHref}
            class="text-sm text-gray-400 transition hover:text-white"
            >{backLabel}</a
        >

        {#if title}
            <h1 class="mt-3 text-3xl font-semibold">{title}</h1>
        {/if}
        {#if description}
            <p class="mt-1 text-sm text-gray-400">{description}</p>
        {/if}

        {@render children?.()}
    </div>
</div>
