<script lang="ts">
    let { data } = $props();
    let prints = $state(data.prints);
    let currentPrint = $derived(prints[0]);
    function addSize(): void {
        currentPrint.sizes = [...currentPrint.sizes, { size: "", price: "" }];
    }
    function removeSize(index: number): void {
        currentPrint.sizes = currentPrint.sizes.filter(
            (_: any, i: number) => i !== index,
        );
    }
</script>

<a href="/Admin/Prints/">BACK</a>
<div class="bg-gray-800 mx-auto overflow-y-scroll">
    Select Print Entry:
    <select
        class="bg-gray-600 rounded-lg p-2 my-2"
        onchange={(change) => {
            let idx = change.target.selectedOptions[0].id;
            currentPrint = prints[idx];
        }}
    >
        {#each prints as print, idx}
            <option id={idx}>{print.title}</option>
        {/each}
    </select>
    <form
        class="grid grid-cols-1 text-xl overflow-y-scroll"
        onsubmit={(e) => {
            e.preventDefault();
            const res = fetch(`/Admin/Prints/${currentPrint.id}`, {
                method: "PUT",
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
                        alert("Updated Entry Sucessfully");
                    } else {
                        alert("Error Occured");
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
        {#each currentPrint.sizes as size, index}
            <div
                style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;"
            >
                <label>
                    Size:
                    <input type="text" bind:value={size.size} />
                </label>
                <label>
                    Price:
                    <input type="text" bind:value={size.price} />
                </label>
                <button type="button" onclick={() => removeSize(index)}
                    >Remove</button
                >
            </div>
        {/each}

        <button type="button" onclick={addSize}>+ Add Size</button>

        <button type="submit"> Submit</button>
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
