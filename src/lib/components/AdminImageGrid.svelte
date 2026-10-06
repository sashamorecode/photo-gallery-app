<script lang="ts">
    import AdminImageUploadField from "./AdminImageUploadField.svelte";

    type GridImage = {
        src: string;
        alt?: string;
        title?: string;
    };

    let {
        images,
        onChange,
        showMeta = false,
        addLabel = "+ Add image",
        emptyLabel = "No images yet. Add your first image below.",
    } = $props<{
        images: GridImage[];
        onChange?: () => void;
        showMeta?: boolean;
        addLabel?: string;
        emptyLabel?: string;
    }>();

    let dragIndex = $state<number | null>(null);
    let dragOverIndex = $state<number | null>(null);

    function notify() {
        onChange?.();
    }

    function addImage() {
        images.push(showMeta ? { src: "", alt: "", title: "" } : { src: "" });
        notify();
    }

    function removeImage(index: number) {
        images.splice(index, 1);
        notify();
    }

    function moveImage(from: number, to: number) {
        if (to < 0 || to >= images.length || to === from) {
            return;
        }
        const [moved] = images.splice(from, 1);
        images.splice(to, 0, moved);
        notify();
    }

    function resetDrag() {
        dragIndex = null;
        dragOverIndex = null;
    }

    function handleDragStart(index: number, event: DragEvent) {
        dragIndex = index;
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", String(index));
        }
    }

    function handleDragOver(index: number, event: DragEvent) {
        event.preventDefault();
        if (dragIndex === null || dragIndex === index) {
            return;
        }
        dragOverIndex = index;
    }

    function handleDrop(index: number, event: DragEvent) {
        event.preventDefault();
        if (dragIndex === null || dragIndex === index) {
            resetDrag();
            return;
        }
        moveImage(dragIndex, index);
        resetDrag();
    }
</script>

{#if images.length === 0}
    <div
        class="rounded-xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400"
    >
        {emptyLabel}
    </div>
{:else}
    <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each images as image, index (index)}
            <li
                draggable="true"
                ondragstart={(event) => handleDragStart(index, event)}
                ondragover={(event) => handleDragOver(index, event)}
                ondrop={(event) => handleDrop(index, event)}
                ondragend={resetDrag}
                class="group relative overflow-hidden rounded-xl border bg-gray-900 transition
                    {dragOverIndex === index
                    ? 'border-amber-400 ring-2 ring-amber-400/40'
                    : 'border-gray-700'}
                    {dragIndex === index ? 'opacity-40' : ''}"
            >
                <div class="relative">
                    {#if image.src}
                        <img
                            src={image.src}
                            alt={image.alt || `Image ${index + 1}`}
                            class="h-44 w-full object-cover"
                            loading="lazy"
                            draggable="false"
                        />
                    {:else}
                        <div
                            class="flex h-44 w-full items-center justify-center text-sm text-gray-500"
                        >
                            No image selected
                        </div>
                    {/if}

                    <button
                        type="button"
                        aria-label="Remove image"
                        onclick={() => removeImage(index)}
                        class="absolute right-2 top-2 rounded-md bg-red-600 px-2 py-1 text-sm transition hover:bg-red-500"
                        >✕</button
                    >
                </div>

                <div class="flex items-center gap-2 p-3">
                    <span
                        class="shrink-0 cursor-grab select-none text-lg leading-none text-gray-500 active:cursor-grabbing"
                        title="Drag to reorder"
                        aria-hidden="true">⠿</span
                    >

                    <div class="min-w-0 flex-1">
                        <AdminImageUploadField
                            variant="compact"
                            label={`Image ${index + 1}`}
                            value={image.src}
                            setValue={(nextValue) => {
                                image.src = nextValue;
                                notify();
                            }}
                        />
                    </div>

                    <span
                        class="shrink-0 text-2xl font-bold leading-none text-white"
                        title={`Position ${index + 1}`}>{index + 1}</span
                    >
                </div>

                {#if showMeta}
                    <div class="flex flex-col gap-2 px-3 pb-3">
                        <input
                            type="text"
                            placeholder="Alt text"
                            value={image.alt ?? ""}
                            oninput={(event) => {
                                image.alt = event.currentTarget.value;
                                notify();
                            }}
                            class="w-full rounded-lg border border-gray-700 bg-gray-950 px-2 py-1 text-base text-gray-100 outline-none transition focus:border-amber-400"
                        />
                        <input
                            type="text"
                            placeholder="Title"
                            value={image.title ?? ""}
                            oninput={(event) => {
                                image.title = event.currentTarget.value;
                                notify();
                            }}
                            class="w-full rounded-lg border border-gray-700 bg-gray-950 px-2 py-1 text-base text-gray-100 outline-none transition focus:border-amber-400"
                        />
                    </div>
                {/if}
            </li>
        {/each}
    </ul>
{/if}

<button
    type="button"
    onclick={addImage}
    class="mt-4 w-full rounded-xl border border-dashed border-gray-600 py-3 text-gray-300 transition hover:border-gray-400 hover:text-white"
>
    {addLabel}
</button>
