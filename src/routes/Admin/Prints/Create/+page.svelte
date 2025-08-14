<script lang="ts">
    type Size = {
        size: string;
        price: string;
    };

    let sizes: Size[] = [{ size: "", price: "" }];

    function addSize(): void {
        sizes = [...sizes, { size: "", price: "" }];
    }

    function removeSize(index: number): void {
        sizes = sizes.filter((_, i) => i !== index);
    }
</script>

<a href="/Admin/Prints/">BACK</a>
<div class="bg-gray-800 mx-auto overflow-y-scroll">
    <form
        action="/Admin/Prints/Create"
        method="POST"
        enctype="multipart/form-data"
        class="grid grid-cols-1 text-xl overflow-y-scroll"
    >
        <label>
            Print Title:
            <input type="text" name="title" />
        </label>
        <label>
            Print Description:
            <input type="text" name="description" />
        </label>

        <label>
            Print Source:
            <input type="text" name="src" />
        </label>
        <h3>Sizes</h3>
        {#each sizes as { size, price }, index}
            <div
                style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;"
            >
                <label>
                    Size:
                    <input
                        type="text"
                        name={`sizes${index}][size]`}
                        bind:value={size}
                    />
                </label>
                <label>
                    Price:
                    <input
                        type="text"
                        name={`sizes[${index}][price]`}
                        bind:value={price}
                    />
                </label>
                <button type="button" on:click={() => removeSize(index)}
                    >Remove</button
                >
            </div>
        {/each}

        <button type="button" on:click={addSize}>+ Add Size</button>

        <button type="submit">Submit</button>
    </form>
</div>

<style>
    label {
        margin-bottom: 10px;
        display: flex;
        flex-direction: row;
        border-width: 1px;
        border-color: gray;
    }
    button {
        margin-top: 10px;
    }
    input,
    textarea {
        width: 100%;
    }
</style>
