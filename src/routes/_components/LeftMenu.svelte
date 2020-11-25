<script>
import { onMount } from 'svelte';
import { stores } from '@sapper/app';
import Badge from './Badge.svelte';
import { connect } from '../../libs/sse';
import { emails, sharedEmails, myEmails } from '../../libs/emails/emailProvider';
import { user } from '../../libs/users';
import { labels } from '../../libs/labels/labelProvider';
import LabelMenuItem from './Labels/MenuItem.svelte';

const { page } = stores();
let selected = {};

$: {
  console.log($page);
	selected = {};
	if ($page.params.folder) {
		selected.folder = $page.params.folder;
	} else if ($page.params.labelName) {
		selected.labelName = $page.params.labelName;
	} else if ($page.path === '/tasks') {
    selected.tasks = true;
  }
};
$: unreadAll = $emails.filter(e => !e.userState[$user._id] || !e.userState[$user._id].seen).length;
$: unreadShared = $sharedEmails.filter(e => !e.userState[$user._id] || !e.userState[$user._id].seen).length;
$: unreadMy = $myEmails.filter(e => !e.userState[$user._id] || !e.userState[$user._id].seen).length;

onMount(() => {
	console.log('/inbox: connecting to SSE');
	connect();
});
</script>

<div class="column menu-column">
  <aside class="menu">
    <p class="menu-label">
      Emails
    </p>
    <ul class="menu-list">
      <li>
        <a href="/inbox/all" class:is-active={selected.folder === 'all'}>
          <span>All emails</span>
          <span class="is-pulled-right">
            <Badge classname="has-background-primary" count="{unreadAll}" />
          </span>
        </a>
      </li>
      <li><a href="/inbox/my" class:is-active={selected.folder === 'my'}>
        <span>My emails</span>
        <span class="is-pulled-right">
          <Badge classname="has-background-primary" count="{unreadMy}" />
        </span>
      </a></li>
      <li><a href="/inbox/shared" class:is-active={selected.folder === 'shared'}>
        <span>Shared emails</span>
        <span class="is-pulled-right">
          <Badge classname="has-background-primary" count="{unreadShared}" />
        </span>
      </a></li>
    </ul>
    <p class="menu-label">
      Labels
    </p>
    {#if $labels.length}
      <ul class="menu-list">
        {#each $labels as label}
          <LabelMenuItem {label} selected={selected.labelName} />
        {/each}
      </ul>
    {:else}
      <ul class="menu-list">
        <li>No label yet</li>
      </ul>
    {/if}
    <p class="menu-label">
      Tasks
    </p>
    <ul class="menu-list">
      <li><a href="/tasks" class:is-active={selected.tasks}>My tasks</a></li>
    </ul>
  </aside>
</div>

<style>
.menu-column {
	width: 240px;
	max-width: 240px;
	min-width: 240px;
}
</style>
