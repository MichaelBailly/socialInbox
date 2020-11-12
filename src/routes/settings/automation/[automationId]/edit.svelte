<script context="module">
	export async function preload({ params }) {
		let automationId = params.automationId;

		return { automationId };
	}
</script>

<script>
export let automationId;

import { onMount } from 'svelte';
import { get } from 'api';
import AutomationEditor from '../_components/Editor.svelte';

let automation;

onMount(async () => {
  automation = await get(`/api/automations/${automationId}`);
  console.log('set automation to', automation);
});
</script>

{#if automation}
  {#key automation._id}
    <AutomationEditor {automation} />
  {/key}
{/if}
