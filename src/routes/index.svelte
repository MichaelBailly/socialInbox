<script context="module">
	export function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
		}
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { connect } from '../libs/sse';
	import { emails, fetchEmails, isLoading } from '../libs/emails/emailProvider';
	import EmailListItem from './_components/EmailListItem.svelte';
	import EmailView from './_components/EmailView.svelte';
	import Modal from '../components/Modal.svelte';

	let emailDisplayed = null;

	async function getEmails() {
		fetchEmails();
		console.log(emails);
	}

	const display = (event) => {
		emailDisplayed = event.detail;
	}

	onMount(() => {
		connect();
	});

	getEmails();





</script>

<svelte:head>
	<title>your Social Inbox - SoBox</title>
</svelte:head>

<div class="emails-menu">
	Email menu
</div>

<div class="columns p-0 m-0">
	<div class="column menu-column">
		Menu
	</div>
	<div class="column list-column">
			{#each $emails as email (email._id)}
			<EmailListItem email="{email}" on:display='{display}'></EmailListItem>
			{/each}
	</div>
	<div class="column content-column">
		{#if emailDisplayed}
			<EmailView email="{emailDisplayed}"></EmailView>
		{/if}
	</div>
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
	width: 140px;
	max-width: 140px;
}

.list-column {
	width: 530px;
	max-width: 530px;
	overflow-x: hidden;
  text-overflow: ellipsis;
	white-space: nowrap;
	display: flex;
	flex-direction: column;
}
.content-column {
	overflow: auto;
}
</style>
