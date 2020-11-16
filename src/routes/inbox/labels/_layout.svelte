<script>
  import { fetchEmails } from '../../../libs/emails/emailProvider';
	const getEmails = async () => {
    console.log('/inbox/labels: loading emails');
		return fetchEmails().then(emails => {
			console.log(emails);
		});
	}
</script>

<svelte:head>
	<title>labels - SoBox</title>
</svelte:head>

{#await getEmails()}
Loading emails............  
{:then foo} 
<slot />
{/await}

