<script>

export let trigger;

</script>
{#if trigger.processor === 'title'}email subject contains
{:else if trigger.processor === 'from'} email sender contains
{:else if trigger.processor === 'recipient'} at least one of the email recipients contains
{/if} "<strong>{trigger.value}</strong>"
