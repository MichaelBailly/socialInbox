<script>
import { onMount } from 'svelte';

import { start, unreadNotifications } from '../../../libs/notificationProvider';
import Badge from '../Badge.svelte';
import Activity from './Activity/Activity.svelte';
import ClickOutside from '../ClickOutside.svelte';

let isMenuOpened = false;
const closeMenu = () => isMenuOpened = false;
onMount(() => {
  start();
});
</script>
<ClickOutside on:clickoutside={closeMenu}>

  <div class="dropdown is-right" class:is-active={isMenuOpened}>
    <div class="dropdown-trigger">
      <button class="button" title="Notifications" on:click={() => isMenuOpened = !isMenuOpened}>
        <span class="icon">
          <i class="far fa-flag fa-lg"></i>
          <span class="badge">
            <Badge count={$unreadNotifications.length} classname="has-background-success" />
          </span>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" role="menu">
      <div class="dropdown-content p-3">
        {#each $unreadNotifications as userNotification}
        <Activity {userNotification} />
        {:else}
        <div>
          No unread notification
        </div>
        {/each}

      </div>
    </div>
  </div>
</ClickOutside>

  <style>
.icon {
  position: relative;
}

.badge {
  position: absolute;
  bottom: -14px;
  right: -14px;
}

/* contents */

.dropdown-menu {
  min-width: 40rem;
}

</style>
