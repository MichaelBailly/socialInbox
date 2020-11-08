<script>
import { COLORS } from '../../../libs/labels/helpers';
export let label;
</script>

<span class="tag {COLORS[label.colorId]}">
  <span class="icon">
    <i class="fas fa-tag"></i>
  </span>
  <span>
    {label.name}
  </span>
</span>
