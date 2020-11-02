<script context="module">
	export function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
		}
	}
</script>

<script>
	import { get } from 'api.js';
	import { emails, fetchEmails, isLoading } from '../libs/emails/emailProvider';

	async function getEmails() {
		fetchEmails();
		console.log(emails);
		console.log('/api/emails', emails);
	}

	setTimeout(getEmails, 0);
</script>

<style>
	h1, p {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}


	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>SoBox: your Social Inbox</title>
</svelte:head>

<h1>Great success! {$emails.length}</h1>
	{#each $emails as email}
	<div>{email.email.subject}</div>
	{/each}

<p><strong>Try editing this file (src/routes/index.svelte) to test live reloading.</strong></p>
