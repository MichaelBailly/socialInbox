<script>
import { user } from '../libs/users';
import UserInline from '../routes/_components/User/Inline.svelte';
</script>

<style>
nav {
	height: 56px;
	border-bottom: 1px solid #ddd;
	margin-bottom: 3px;
}
</style>

<nav class="navbar" role="navigation" aria-label="main navigation">
	<div class="navbar-brand">
    <a class="navbar-item" href="/inbox">
      SoBox
    </a>
    <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" href="void(0)">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
	</div>
	<div id="navbarBasicExample" class="navbar-menu">
    <div class="navbar-start">
      <a class="navbar-item" href="/inbox">
        Inbox
      </a>
    </div>

    <div class="navbar-end">
      <div class="navbar-item">
        <a class="button" href="/settings" title="Settings">
          <span class="icon">
            <i class="fas fa-cog fa-lg"></i>
          </span>
        </a>
        <UserInline user={$user} bgclass="has-background-white-bis is-large" />
      </div>
    </div>
	</div>
</nav>
