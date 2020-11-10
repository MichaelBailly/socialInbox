<script context="module">
	export async function preload({ params }) {
		let folder = params.folder;

		return { folder };
	}
</script>

<script>
  export let folder;

  import { onMount } from 'svelte';
	import { connect } from '../../../libs/sse';
	import { emails, myEmails, sharedEmails, fetchEmails, isLoading } from '../../../libs/emails/emailProvider';
	import EmailListItem from '../../_components/EmailListItem.svelte';

  let emailsList = emails;

  $: {
    if (folder === 'my') {
      emailsList = myEmails;
    } else if (folder === 'shared') {
      emailsList = sharedEmails;
    } else {
      folder = 'all';
      emailsList = emails;
    }
  };

  $: baseHref = `/inbox/${folder}`;

	const getEmails = async () => {
		fetchEmails();
		console.log(emails);
	}

	onMount(connect);

	getEmails();
</script>

<svelte:head>
	<title>All mails - SoBox</title>
</svelte:head>


<div class="column list-column">
    {#each $emailsList as email (email._id)}
    <EmailListItem email="{email}" {baseHref}></EmailListItem>
    {:else}
    Nothing to display
    {/each}
</div>
<div class="column content-column p-0">
  <slot></slot>
</div>


<style lang='less'>
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
