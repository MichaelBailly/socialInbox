<script>
export let date;

import { parseISO, isToday, format } from "date-fns";

$: dateObj = parseISO(date);
$: hoursOnly = isToday(dateObj);
$: displayAlt = format(dateObj, 'eee MMM d, Y HH:mm');
$: displayDate = hoursOnly ? format(dateObj, 'HH:mm') : displayAlt;
</script>

<div class="activity mt-4">
  <div class="mr-2">
    <slot name="icon">
      <span class="icon is-medium has-text-info">
        <i class="fas fa-lg fa-info-circle"></i>
      </span>
    </slot>
  </div>
  <div class="content">
    <div>
      <small>{displayDate}</small>
    </div>
    <div>
      <slot />
    </div>
  </div>
</div>

<style lang="less">
.activity {
  display: flex;
  align-items: center;

  .content {
    line-height: 95%;
  }
}
</style>
