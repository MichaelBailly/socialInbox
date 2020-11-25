<script>
import { formatDistanceToNow } from "date-fns";


export let date = new Date();

$: human = formatDistanceToNow(date);
</script>

{human}
