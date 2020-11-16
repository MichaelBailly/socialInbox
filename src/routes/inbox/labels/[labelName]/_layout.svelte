<script context="module">
	export async function preload({ params }) {
		let labelName = params.labelName;

		return { labelName };
	}
</script>

<script>
export let segment;
export let labelName;

import { emails } from '../../../../libs/emails/emailProvider';
import EmailListItem from '../../../_components/EmailListItem.svelte';

const baseHref = `/inbox/labels/${encodeURIComponent(labelName)}`;

let emailList = [];
$: {
  console.log('in labelname _layout', labelName);
  emailList = $emails.filter(e => e.labels.some((l => l.name === labelName)));
};

</script>

<svelte:head>
	<title>labels - SoBox</title>
</svelte:head>

<div class="column list-column">
  {#each emailList as email (email._id)}
  <EmailListItem email="{email}" {baseHref} selected={email._id === segment}></EmailListItem>
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
	flex: 1 1 auto;
  overflow-y: auto;
}
.content-column {
	overflow: auto;
	display: flex;
	flex-direction: row;
}
</style>
