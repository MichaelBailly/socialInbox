<script>
export let userNotification;

import { parseISO, isToday, format } from "date-fns";

$: dateObj = parseISO(userNotification.activity.date);
$: hoursOnly = isToday(dateObj);
$: displayAlt = format(dateObj, 'eee MMM d, Y HH:mm');
$: displayDate = hoursOnly ? format(dateObj, 'HH:mm') : displayAlt;
</script>

<div class="block">
  <div class="image">
    <slot name="icon">
      <span class="icon is-medium has-text-info">
        <i class="fas fa-lg fa-info-circle"></i>
      </span>
    </slot>
    <span class="notificationTitle">
      <slot name="title"></slot>
    </span>
  </div>
  <div class="content">
    <div>
      <slot />
    </div>
    <div>
      <small>{displayDate}</small>
    </div>
  </div>
</div>

<style>
.block {
  display: flex;
  flex-direction: column;
}


</style>
