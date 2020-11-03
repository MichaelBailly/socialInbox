<script>
export let email;

let body = '';

$: {
  if (!email || !email.email) {
    body = '';
  } else {
    let bodyDescriptor;
    if (email.email.htmlBody.length) {
      bodyDescriptor = email.email.htmlBody[0];
    } else if (email.email.textBody.length) {
      bodyDescriptor = email.email.textBody[0];
    }

    if (bodyDescriptor) {
      body = email.email.bodyValues[bodyDescriptor.partId].value;
      if (bodyDescriptor.type === 'text/plain') {
        body = body.replace(/\n/g, '<br />\n');
      }
    }
  }
};
</script>

{@html body}
