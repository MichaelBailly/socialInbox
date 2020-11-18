<script>
import { emails } from "../../../../libs/emails/emailProvider";
import Label from '../../../_components/Labels/Label.svelte';
import Badge from '../../../_components/Badge.svelte';

export let label;
export let selected;

$: emailCount = $emails.filter((email) => email.labels.some(l => l._id === label._id)).length;
</script>

<li>
  <a href="/inbox/labels/{label.name}" class:is-active={selected === label.name}>
    <Label {label} />
    <span class="is-pulled-right">
        <Badge classname="has-background-primary" count="{emailCount}" />
    </span>
  </a>
</li>
