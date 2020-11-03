<script>
	import Nav from '../components/Nav.svelte';

	export let segment;
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
