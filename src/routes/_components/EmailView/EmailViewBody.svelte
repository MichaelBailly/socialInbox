<script>
export let email;

let body = '';
console.log('emailview body', email);
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
    } else {
      body = '';
    }
  }
};
</script>

{@html body}
