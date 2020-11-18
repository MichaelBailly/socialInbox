<script context="module">
	export async function preload({ params }) {
		let folder = params.folder;

		return { folder };
	}
</script>

<script>
	export let segment;
  export let folder;

	import { emails, myEmails, sharedEmails, fetchEmails } from '../../../libs/emails/emailProvider';
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
</script>

<svelte:head>
	<title>All mails - SoBox</title>
</svelte:head>

<div class="column list-column" tabindex="-1">
	{#each $emailsList as email, index (email._id)}
	<EmailListItem email="{email}" {baseHref} selected={email._id === segment} tabindex="{index}"></EmailListItem>
	{:else}
	Nothing to display !
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
	flex: 1 1 auto;
  overflow-y: auto;
}

.content-column {
	overflow: auto;
	display: flex;
	flex-direction: row;
}
</style>
