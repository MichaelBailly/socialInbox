<script context="module">

	export async function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
			return;
		}
		console.log('loading labels, on server = ', typeof window === 'undefined');
		const labellist = await loadLabels(this.fetch);

		console.log('Fetching emails in preload');
		const emailResponse = await send({
      method: 'GET',
			path: '/api/emails',
			fetchInstance: this.fetch,
    });

		return { labellist, emaillist: emailResponse.emails };
	}
</script>

<script>
import { onMount } from 'svelte';
import Modal from '../../components/Modal.svelte';
import { loadLabels } from '../../libs/labels/labelProvider';
import { connect } from '../../libs/sse';
import { emails } from '../../libs/emails/emailProvider';
import LeftMenu from '../_components/LeftMenu.svelte';
import { send } from 'api';

export let emaillist;

console.log('setting emails', emaillist.length);
emails.set(emaillist);

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
<div class="columns p-0 m-0">
	<LeftMenu />
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

</style>
