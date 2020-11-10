<script context="module">
	import { user as localUser } from '../libs/users';
	export function preload({ params }, { user }) {
		if (user) {
			localUser.set(user);
		}
	}
</script>

<script>
import { onMount } from 'svelte';
import Nav from '../components/Nav.svelte';
import Modal from '../components/Modal.svelte';
import { connect } from '../libs/sse';
import { user } from '../libs/users';
import { loadLabels } from '../libs/labels/labelProvider';

export let segment;

onMount(() => {
	let hadUser = false;
	user.subscribe((user) => {
		if (!user._id) {
			hadUser = false;
			return;
		}
		if (!hadUser) {
			loadLabels();
			connect();
		}
		hadUser = true;
	});
});
</script>

<style global lang="less">
.flex-row {
	flex-direction: row;
}

body, html, #sapper {
	height: 100%;
	overflow-y: auto;
}

#sapper {
	overflow-y: auto;
}
main {
	height: calc(100% - 60px);
	overflow-y: auto;
	overflow-x: hidden;
}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>
<Modal />
