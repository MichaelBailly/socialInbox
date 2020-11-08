<script>
import { onMount } from 'svelte';
import Nav from '../components/Nav.svelte';
import Modal from '../components/Modal.svelte';
import { connect } from '../libs/sse';

export let segment;

onMount(connect);
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
