<script>
    export let name = "";
    export let email = "";
    export let phone = "";
    export let message = "";
</script>

<html lang="en">
    <body
        style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;"
    >
        <h2 style="color: #2c3e50;">New Contact Request</h2>

        <p><strong>From:</strong> {name}</p>

        <p><strong>Message:</strong></p>
        <p
            style="margin: 10px 0; padding: 10px; background: #f7f7f7; border-left: 4px solid #2c3e50;"
        >
            {message}
        </p>

        <p>
            <strong>Contact Details:</strong><br />
            Email: <a href="mailto:{email}" style="color: #2c3e50;">{email}</a>
        </p>

        {#if phone !== ""}
            <p>
                Phone: <a href="tel:{phone}" style="color: #2c3e50;">{phone}</a>
            </p>
        {/if}
    </body>
</html>
