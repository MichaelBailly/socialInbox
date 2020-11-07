<script>
export let date;

import { parseISO, isToday, format } from "date-fns";

$: dateObj = parseISO(date);
$: hoursOnly = isToday(dateObj);
$: displayAlt = format(dateObj, 'eee MMM d, Y HH:mm');
$: displayDate = hoursOnly ? format(dateObj, 'HH:mm') : displayAlt;
</script>

<div class="card activity">
  <div class="card-content">
    <div class="content">
      <div class="columns">
        <div class="column is-narrow">
          <slot name="icon">
            <span class="icon is-large has-text-info">
              <i class="fas fa-3x fa-info-circle"></i>
            </span>
          </slot>
        </div>
        <div class="column">
          <div><small>{displayDate}</small></div>
          <slot />
        </div>
      </div>
    </div>
  </div>
</div>
