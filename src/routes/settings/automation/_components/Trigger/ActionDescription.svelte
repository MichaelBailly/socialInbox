<script>
export let action;

import Label from '../../../../_components/Labels/Label.svelte';
</script>
{#if action.processor === 'share'}
share the email with
  {#each action.value as user, index}
    <strong>{user.displayName}</strong>
    {#if (index + 1) !== action.value.length}, {/if}
  {/each}
{:else if action.processor === 'label'}
add the label(s)
  {#each action.value as label}
   <span class="mr-1">
    <Label {label} />
   </span>
  {/each}
to the email
{/if}
