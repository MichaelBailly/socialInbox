<script>
  import { fetchEmails } from '../../../libs/emails/emailProvider';
	const getEmails = async () => {
		return fetchEmails();
	}
</script>

<svelte:head>
	<title>labels - SoBox</title>
</svelte:head>

<slot />

