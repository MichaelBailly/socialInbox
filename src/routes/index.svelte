<script context="module">
	import { user as localUser } from '../libs/users';
	export function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
		} else {
			this.redirect(302, `/inbox`);
		}
	}
</script>
