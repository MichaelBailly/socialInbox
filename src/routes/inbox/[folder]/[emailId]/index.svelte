<script context="module">
	export async function preload({ params }) {
		let emailId = params.emailId;

		return { emailId };
	}
</script>

<script>
export let emailId;
import WorkSpace from '../../_components/WorkSpace.svelte';
import { emails } from '../../../../libs/emails/emailProvider.js';

$: email = $emails.find((e) => e._id === emailId);

</script>

<WorkSpace {email} />
