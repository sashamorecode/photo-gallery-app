<script>
    import { invalidate } from "$app/navigation";
    let password = "";
    let error = false;
    let triesLeft = "";
    async function login(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const res = await fetch("/Signin", {
            method: "POST",
            body: formData,
        });
        res.json().then((j) => {
            console.log(j);
            if (j.status === 401) {
                triesLeft = j.data;
                error = true;
            } else {
                location.href = j.location
            }
        });
    }
</script>

<div class="flex flex-col">
    <form on:submit={login}>
        <label>
            Password
            <input
                type="password"
                name="password"
                bind:value={password}
                required
            />
        </label>
        <button type="submit">Login</button>
    </form>
    {#if error}
        <p class="bg-red-400"></p>
        <p class="bg-red-500">
            Wrong Password you have: {triesLeft} tires left
        </p>
    {/if}
</div>
