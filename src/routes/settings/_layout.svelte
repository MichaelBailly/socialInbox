<script context="module">
	import { user as localUser } from '../../libs/users';
	export function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
		} else {
			localUser.set(user);
		}
	}
</script>

<div class="columns p-0 m-0">

	<div class="column menu-column">
		<aside class="menu">
			<p class="menu-label">
				Settings
			</p>
			<ul class="menu-list">
				<li><a href="/settings/labels">Labels</a></li>
			</ul>
		</aside>
  </div>
  <div class="content-column">
    <slot />
  </div>
</div>

<style lang='less'>
.columns {
	overflow-y: hidden;
	height: calc(100% - 52px);
}

.menu-column {
	width: 240px;
	max-width: 240px;
}
.content-column {
  flex-grow: 1;
}
</style>
