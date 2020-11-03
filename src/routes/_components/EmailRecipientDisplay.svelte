<script>
export let recipient;

$: name = recipient.name ||recipient.email;
$: email = recipient.email;
</script>

<span title="{email}">{name}</span>
