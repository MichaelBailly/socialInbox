<script context="module">
	export function preload({ params }, { user }) {
		if (!user) {
			this.redirect(302, `/login`);
		} else {
			this.redirect(302, `/inbox`);
		}
	}
</script>
