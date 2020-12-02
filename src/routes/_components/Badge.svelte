<script>
export let classname;
export let count;
export let maxCount = 99;
export let hideOnZero = true;

$: displayedCount = count < maxCount ? count : `${maxCount}+`;
</script>
{#if !hideOnZero || displayedCount}
<span class="badge has-text-weight-semibold {classname}">{displayedCount}</span>
{/if}

<style>
.badge {
  border-radius: 8px;
  padding: 0.2em 0.5em;
  font-size: 0.75rem;
  color: hsl(0,0%,98%);
}
</style>
