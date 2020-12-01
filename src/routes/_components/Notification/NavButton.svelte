<script>
import { onMount } from 'svelte';
import { post } from 'api';
import { start, unreadNotifications } from '../../../libs/notificationProvider';
import Badge from '../Badge.svelte';
import Activity from './Activity/Activity.svelte';
import ClickOutside from '../ClickOutside.svelte';
import NotificationClearAll from 'svelte-material-icons/NotificationClearAll.svelte';

let isMenuOpened = false;
let notificationsClearing = false;
const closeMenu = () => isMenuOpened = false;

const clearNotification = (event) => {
  console.log("event clear on", event.detail);
};

const onClear = async (userNotification) => {
  console.log('clear', userNotification);
  if (notificationsClearing) {
    return;
  }
  notificationsClearing = true;

  try {
    console.log('request to /api/notifications/seen');
    const response = await post('/api/notifications/seen', { id: userNotification._id });
    console.log(response);
  } catch(e) {
    console.log('POST /api/notifications/seen error', e);
  }
  notificationsClearing = false;
}

const onClearAll = async () => {
  if (notificationsClearing) {
    return;
  }
  notificationsClearing = true;
  const notification = $unreadNotifications[0];
  if (!notification) {
    console.log('no notification');
    notificationsClearing = false;
    return false;
  }
  const date = notification.activity.date;
  try {
    console.log('request to /api/notifications/seen');
    const response = await post('/api/notifications/seen', { lastActivityDate: date });
    console.log(response);
  } catch(e) {
    console.log('POST /api/notifications/seen error', e);
  }
  notificationsClearing = false;
};

onMount(start);
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
        {#if $unreadNotifications.length}
        <div class="panel is-success has-background-white">
          <p class="panel-heading">
            <span>
              Notifications
            </span>
            <button class="button is-success" title="Clear all notifications" class:is-hidden={!$unreadNotifications.length} disabled={notificationsClearing} on:click={onClearAll}>
              <NotificationClearAll width="2rem" height="2rem" />
            </button>
          </p>
          <div class="panel-block">
            <div class="notifications">
              {#each $unreadNotifications as userNotification}
              <div class="notificationItem">
                <div class="clearForm">
                  <button class="button" on:click={() => onClear(userNotification)} title="Clear notification"  disabled={notificationsClearing}>
                    <span class="icon is-small">
                      <i class="far fa-times-circle" />
                    </span>
                  </button>
                </div>
                <Activity {userNotification} showClearControl={true} on:clear={clearNotification} />
              </div>
              {/each}
            </div>
            <div class="controls">

            </div>
          </div>
        </div>

        {:else}
        <div class="dropdown-content p-3">
          <div class="no-modif">
            <div>
              No unread notification
            </div>
          </div>
        </div>
        {/if}

    </div>
  </div>
</ClickOutside>

<style lang="less">

.panel-heading {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.icon {
  position: relative;
}

.badge {
  position: absolute;
  bottom: -14px;
  right: -14px;
}

/* contents */
.no-modif {
  flex-grow: 1;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.is-active {
  .dropdown-menu {
    min-width: 40rem;
    min-height: 15rem;
    display: flex;
    flex-direction: column;
  }

  .dropdown-content {
    flex-grow: 1;

    display: flex;
    flex-direction: column;
  }

  .panel {
    flex-grow: 1;
  }

  .panel-block {
    display: flex;
    flex-direction: row;

    > .notifications {
      flex: 1 0 auto;
      max-height: 30rem;
      overflow-y: auto;

      > .notificationItem {
        position: relative;
        margin: 0.5rem 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #EEEEEE;

        > .clearForm {
          display: none;
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          flex-direction: column;
          justify-content: center;
        }
      }

      > .notificationItem:hover .clearForm {
        display: flex;
      }
    }
    > .controls {
      display: none;
    }
  }
}

</style>
