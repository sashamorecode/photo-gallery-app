<script>
    export let price = "";
    export let print = { src: "", title: "", sizes: [{ size: "", price: "" }] };
    export let email = "";
    export let address = "";
    export let message = "";
    let size = print.sizes.find((x) => {
        console.log(x, price, x.price.toString() === price);
        return x.price == price.toString();
    })?.size
</script>

<html lang="en">
    <body
        style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;"
    >
        <h2 style="color: #2c3e50;">New Print Request</h2>

        <p><strong>The requested print:</strong></p>
        <p
            style="margin: 10px 0; padding: 10px; background: #f7f7f7; border-left: 4px solid #2c3e50;"
        >
            {print.title}
            <img src={print.src} alt={print.src} />
        </p>

        <p><strong>The requested size:</strong></p>
        <p
            style="margin: 10px 0; padding: 10px; background: #f7f7f7; border-left: 4px solid #2c3e50;"
        >
            {size}
        </p>

        <p><strong>Price:</strong></p>
        <p
            style="margin: 10px 0; padding: 10px; background: #f7f7f7; border-left: 4px solid #2c3e50;"
        >
            {price}
        </p>
        <p><strong>To be delivered to:</strong></p>
        <p
            style="margin: 10px 0; padding: 10px; background: #f7f7f7; border-left: 4px solid #2c3e50;"
        >
            {address}
        </p>
        {#if message !== ""}
            <p><strong>message:</strong></p>
            <p
                style="margin: 10px 0; padding: 10px; background: #f7f7f7; border-left: 4px solid #2c3e50;"
            >
                {message}
            </p>
        {/if}
        <p>
            <strong>Contact Details:</strong><br />
            Email: <a href="mailto:{email}" style="color: #2c3e50;">{email}</a>
        </p>
    </body>
</html>
