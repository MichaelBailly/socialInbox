<script>
import EmailViewShareForm from "./EmailViewShareForm.svelte";

export let email;

$: sharedUserCount = email.users.concat(email.usersShared).length;

let isVisible = false;

const toggleVisible = () => isVisible = !isVisible;
</script>

<div class="dropdown is-right" class:is-active="{isVisible}">
  <div class="dropdown-trigger">
    <button class="button is-link is-light" on:click="{toggleVisible}">
      <span class="icon is-small">
        <i class="fas fa-circle fa-lock"></i>
      </span>
      <span>Share ({sharedUserCount})</span>
      <span class="icon is-small">
        <i class="fas fa-angle-down" aria-hidden="true"></i>
      </span>
    </button>
  </div>
  <div class="dropdown-menu" role="menu">
    {#if isVisible}
    <EmailViewShareForm email="{email}" />
    {/if}
  </div>
</div>
