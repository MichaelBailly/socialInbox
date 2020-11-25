<script>
  import { createEventDispatcher } from 'svelte';
import { isOpened } from '../../libs/modal/modalService';

  export let exclude = [];

  let child;

  const dispatch = createEventDispatcher();

  function isExcludedFromBlackList(node) {
    return isOpened() || exclude.indexOf(node) >= 0;
  }

  function isExcluded(target) {
    var parent = target;
    while (parent) {
      if (isExcludedFromBlackList(parent) || parent === child) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }

  function onClickOutside(event) {
    if (!isExcluded(event.target)) {
      dispatch('clickoutside');
    }
  }
</script>

<svelte:body on:click={onClickOutside} />
<div bind:this={child}>
  <slot></slot>
</div>
