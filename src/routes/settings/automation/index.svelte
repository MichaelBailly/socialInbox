<svelte:head>
	<title>Automation - Settings - SoBox</title>
</svelte:head>

<script>
import { onMount } from 'svelte';
import { get } from 'api';

let automationRules = [];

onMount(async () => {
  automationRules = await get('/api/automations');
});

</script>

<div class="pt-3 pr-3">
  <nav class="level p-3">
    <div class="level-left">
      <div class="level-item">
        <h1 class="title">Automation Rules</h1>
      </div>
    </div>
    <div class="level-right">
      <div class="level-item">
        <a class="button is-link is-outlined" href="/settings/automation/new">
          Add new...
        </a>
      </div>
    </div>
  </nav>
  <div class="contents">
    {#each automationRules as automationRule}
    <div>
      <p>{automationRule}</p>
      <hr />
    </div>
    {/each}
  </div>
</div>

<style lang="less">
nav {
  border-bottom: 1px solid #eee;
}
</style>
