<script context="module">
	export function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
		}
	}
</script>

<script>
import { onMount } from 'svelte';
import { stores } from '@sapper/app';
import Modal from '../../components/Modal.svelte';
import { labels, loadLabels } from '../../libs/labels/labelProvider';
import Label from '../_components/Labels/Label.svelte';
import { connect } from '../../libs/sse';
import { emails, sharedEmails, myEmails, fetchEmails } from '../../libs/emails/emailProvider';
import { user } from '../../libs/users';
import Badge from '../_components/Badge.svelte';
import LabelMenuItem from './_components/Label/MeunItem.svelte';

const { page } = stores();
let selected = {};

$: {
	selected = {};
	if ($page.params.folder) {
		selected.folder = $page.params.folder;
	} else if ($page.params.labelName) {
		selected.labelName = $page.params.labelName;
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

<svelte:head>
	<title>your Social Inbox - SoBox</title>
</svelte:head>

<div class="emails-menu">
	Email menu
</div>
{#await Promise.all([loadLabels(), fetchEmails()])}
Loading your inbox...
{:then foo}
<div class="columns p-0 m-0">

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
				<li><a href="/inbox/all">My tasks</a></li>
			</ul>
		</aside>
  </div>
  <slot>In layout</slot>
</div>
{/await}
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
