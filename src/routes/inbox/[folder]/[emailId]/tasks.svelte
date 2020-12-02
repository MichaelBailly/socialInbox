<script context="module">
	export async function preload({ params }) {
		let emailId = params.emailId;

		return { emailId };
	}
</script>

<script>
export let emailId;

import { stores } from '@sapper/app';
import TasksIndex from '../../_components/Tasks/Index.svelte';
import { emails } from '../../../../libs/emails/emailProvider.js';

const { page } = stores();

$: email = $emails.find((e) => e._id === emailId);
$: emailpath = $page.path.replace(/\/tasks$/, '');

</script>

<TasksIndex {email} {emailpath} />
