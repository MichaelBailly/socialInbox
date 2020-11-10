<script context="module">
	import { user as localUser } from '../../libs/users';
	export function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
		} else {
      localUser.set(user);
		}
	}

</script>
<script>
export let segment;

import Modal from '../../components/Modal.svelte';
import { fetchEmails } from '../../libs/emails/emailProvider';

console.log(segment);
</script>

<svelte:head>
	<title>your Social Inbox - SoBox</title>
</svelte:head>

<div class="emails-menu">
	Email menu
</div>

{#await fetchEmails()}
  Loading...
{:then foo}
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
		</aside>
  </div>
  <slot>In layout</slot>
</div>
{:catch err}
<div>Error: {err.message}</div>
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
