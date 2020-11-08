<script>
export let email;

import WorkSpaceChat from './WorkSpace/Chat.svelte';
import WorkSpaceActivity from './WorkSpace/Activity.svelte';

let workspaceModule = 'chat';

const switchModule = (module) => {
  workspaceModule = module;
}

const switchChat = () => switchModule('chat');
const switchActivity = () => switchModule('activity');
</script>


<div class="workspace pl-4 pr-1">
  <div class="tabs">
    <ul>
      <li class:is-active="{workspaceModule === 'chat'}">
        <!-- svelte-ignore a11y-missing-attribute -->
        <a on:click="{switchChat}">
          <span class="icon is-small"><i class="fas fa-comments" aria-hidden="true"></i></span>
          <span>Chat</span>
        </a>
      </li>
      <li>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a>
          <span class="icon is-small"><i class="fas fa-tasks" aria-hidden="true"></i></span>
          <span>Tasks</span>
        </a>
      </li>
      <li class:is-active="{workspaceModule === 'activity'}">
        <!-- svelte-ignore a11y-missing-attribute -->
        <a on:click="{switchActivity}">
          <span class="icon is-small"><i class="fas fa-stream" aria-hidden="true"></i></span>
          <span>Activity</span>
        </a>
      </li>
    </ul>
  </div>
  {#if workspaceModule === 'chat'}
  <WorkSpaceChat {email} />
  {:else if workspaceModule === 'activity'}
  <WorkSpaceActivity {email} />
  {/if}
</div>

<style lang="less">
  .workspace {
    flex: 0 0 50%;
    height: 100%;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>
