<script context="module">
	export function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
		}
	}
</script>

<script>
import { onMount } from 'svelte';
import Modal from '../../components/Modal.svelte';
import { labels, loadLabels } from '../../libs/labels/labelProvider';
import Label from '../_components/Labels/Label.svelte';
import { connect } from '../../libs/sse';

onMount(() => {
	console.log('/inbox: connecting to SSE');
	connect();
	console.log('/inbox: loading labels');
	loadLabels();
});
</script>

<svelte:head>
	<title>your Social Inbox - SoBox</title>
</svelte:head>

<div class="emails-menu">
	Email menu
</div>

<div class="columns p-0 m-0">

	<div class="column menu-column">
		<aside class="menu">
			<p class="menu-label">
				Emails
			</p>
			<ul class="menu-list">
				<li><a href="/inbox/all">All emails</a></li>
				<li><a href="/inbox/my">My emails</a></li>
				<li><a href="/inbox/shared">Shared with me</a></li>
			</ul>
			<p class="menu-label">
				Labels
			</p>
			{#if $labels.length}
				<ul class="menu-list">
					{#each $labels as label}				
						<li><a href="/inbox/labels/{label.name}"><Label {label} /></a></li>
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
				<li><a href="/inbox/all">My tasks</a></li>
			</ul>
		</aside>
  </div>
  <slot>In layout</slot>
</div>
<Modal />

<style lang='less'>
.emails-menu {
	height: 52px;
}

.columns {
	overflow-y: hidden;
	height: calc(100% - 52px);
}

.menu-column {
	width: 240px;
	max-width: 240px;
}
</style>
