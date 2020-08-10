<script>
	import Nav from '../components/nav.svelte'
	import Actions from '../components/actions.svelte'
</script>

<style>
	:root {
		--primaryColor: #212121;
		--secondaryColor: #ffffff;
		--borderSize: .5rem;
	}

	:global(body),
	:global(html) {
		margin: 0;
		padding: 0;
		font-size: 12px;
		color: var(--primaryColor);
		background: var(--secondaryColor);
	}

	:global(*) {
		box-sizing: border-box;
	} 

	:global(#content) {
		padding: calc(2 * var(--borderSize));
	}

	header {
		font-size: 1.5rem;
		padding: calc(2 * var(--borderSize));
		border-bottom: var(--borderSize) solid var(--primaryColor);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>

<header>
	<Nav />
	<Actions />
</header>

<div id='content'>
	<slot></slot>
</div>