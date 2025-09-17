<script lang="ts">
    let currentPrint = $state({
        title: "",
        description: "",
        src: "",
        sizes: [{ size: "", price: "" }],
    });
    function addSize(): void {
        currentPrint.sizes.push({ size: "", price: "" });
    }

    function removeSize(index: number): void {
        currentPrint.sizes = currentPrint.sizes.filter((_, i) => i !== index);
    }
</script>

<a href="/Admin/Prints/">BACK</a>
<div class="bg-gray-800 mx-auto overflow-y-scroll">
    <form
        class="grid grid-cols-1 text-xl overflow-y-scroll"
        onsubmit={(e) => {
            e.preventDefault();
            const res = fetch(`/Admin/Prints/Create`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-type": "application/json",
                },
                body: JSON.stringify(currentPrint),
            });

            res.then((r) => {
                let jres = r.json();
                jres.then((jsonRes) => {
                    if (jsonRes.success) {
                        alert("Entry Successfully");
                        currentPrint.title = "";
                        currentPrint.description = "";
                        currentPrint.src = "";
                        currentPrint.sizes = [{ size: "", price: "" }];
                    } else {
                        alert("Error Occurred");
                    }
                });
            });
        }}
    >
        <label>
            Print Title:
            <input type="text" name="title" bind:value={currentPrint.title} />
        </label>
        <label>
            Print Description:
            <input
                type="text"
                name="description"
                bind:value={currentPrint.description}
            />
        </label>

        <label>
            Print Source:
            <input type="text" name="src" bind:value={currentPrint.src} />
        </label>
        <h3>Sizes</h3>
        {#each currentPrint.sizes as { size, price }, index}
            <div
                style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;"
            >
                <label>
                    Size:
                    <input
                        type="text"
                        name={`sizes${index}][size]`}
                        bind:value={currentPrint.sizes[index].size}
                    />
                </label>
                <label>
                    Price:
                    <input
                        type="text"
                        name={`sizes[${index}][price]`}
                        bind:value={currentPrint.sizes[index].price}
                    />
                </label>
                <button type="button" onclick={() => removeSize(index)}
                    >Remove</button
                >
            </div>
        {/each}

        <button type="button" onclick={addSize}>+ Add Size</button>

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
