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
import { loadLabels } from '../../libs/labels/labelProvider';
import { connect } from '../../libs/sse';
import { fetchEmails } from '../../libs/emails/emailProvider';
import LeftMenu from '../_components/LeftMenu.svelte';

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
	<LeftMenu />
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

</style>
