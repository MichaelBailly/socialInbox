<script>
import { parseISO, isToday, format } from "date-fns";

export let email;
export let fullDate = false;


$: emailDate = parseISO(email.lastModified);
$: hoursOnly = isToday(emailDate);
$: displayAlt = format(emailDate, 'eee MMM d, Y HH:mm');
$: displayDate = !fullDate && hoursOnly ? format(emailDate, 'HH:mm') : displayAlt;


</script>

<span title="{displayAlt}">{displayDate}</span>
