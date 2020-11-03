<script>
import { parseISO, isToday, format } from "date-fns";

export let email;
export let fullDate = false;


$: emailDate = parseISO(email.lastModified);
$: hoursOnly = isToday(emailDate);
$: displayDate = !fullDate && hoursOnly ? format(emailDate, 'HH:mm') : format(emailDate, 'eee MMM d, Y HH:mm');
$: displayAlt = format(emailDate, 'eee MMM d, Y HH:mm');

</script>

<span title="{displayAlt}">{displayDate}</span>
