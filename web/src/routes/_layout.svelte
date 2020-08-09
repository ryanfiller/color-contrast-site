<script>
	import Nav from '../components/Nav.svelte';

	export let segment;
</script>

<style>
	:global(body),
	:global(html) {
		margin: 0;
		padding: 0;
		font-size: 12px;
	}

	:global(*) {
		box-sizing: border-box;
	} 

	:global(#content) {
		display: flex;
	}

	:global(main) {
		flex: 5;
		padding: 1rem;
	}

	:global(aside) {
		flex: 1;
		padding: 1rem 1rem 1rem 0;
	}
</style>

<Nav {segment}/>

<div id='content'>
	<slot></slot>
</div>