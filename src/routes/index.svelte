<script context="module">
	import { user as localUser } from '../libs/users';
	export function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
		} else {
			localUser.set(user);
		}
	}
</script>

<script>
	import { emails, myEmails, sharedEmails, fetchEmails, isLoading } from '../libs/emails/emailProvider';
	import EmailListItem from './_components/EmailListItem.svelte';
	import EmailView from './_components/EmailView.svelte';
	import WorkSpace from './_components/WorkSpace.svelte';

	let displayEmailId = null;
	$: emailDisplayed = displayEmailId === null ? null : $emails.find(e => e._id === displayEmailId);
	let emailDisplayed = null;
	let emailsList = emails;

	const getEmails = async () => {
		fetchEmails();
		console.log(emails);
	}

	const display = (event) => {
		displayEmailId = event?.detail?._id || null;
	}

	const displayAll = () => {
		if (emailsList === emails) {
			return;
		}
		emailsList = emails;
		display({});
	}

	const displayShared = () => {
		if (emailsList === sharedEmails) {
			return;
		}
		emailsList = sharedEmails;
		display({});
	}

	const displayMy = () => {
		if (emailsList === myEmails) {
			return;
		}
		emailsList = myEmails;
		display({});
	}

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
		<aside class="menu">
			<p class="menu-label">
				Emails
			</p>
			<ul class="menu-list">
				<li><a on:click|preventDefault="{displayAll}" href="void(0)" class:is-active='{emailsList === emails}'>All emails</a></li>
				<li><a on:click|preventDefault="{displayMy}" href="void(0)" class:is-active='{emailsList === myEmails}'>My emails</a></li>
				<li><a on:click|preventDefault="{displayShared}" href="void(0)" class:is-active='{emailsList === sharedEmails}'>Shared with me</a></li>
			</ul>
		</aside>
	</div>
	<div class="column list-column">
			{#each $emailsList as email (email._id)}
			<EmailListItem email="{email}" on:display='{display}'></EmailListItem>
			{:else}
			Nothing to display
			{/each}
	</div>
	<div class="column content-column">
		{#if emailDisplayed}
			<EmailView email="{emailDisplayed}" />
			<WorkSpace email="{emailDisplayed}" />
		{/if}
	</div>
</div>

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
	display: flex;
	flex-direction: row;
}
</style>
