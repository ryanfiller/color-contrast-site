<script>
	import { data, actions } from './stores.js'
	$: if ('DEVELOPMENT' === 'true') {
		console.log('$data', $data)
	}

	import Breadcrumbs from './components/breadcrumbs.svelte'
	import ActionsButtons from './components/actions-buttons.svelte'
	import ActionsArea from './components/actions-area.svelte'

	export let owner
	export let palette
</script>

<style>
	:root {
		/* these can be changed with action buttons */
		/* --backgroundColor: #212121; */
		/* --textColor: #ffffff; */
		--highlight: #ff1493; /* deeppink */
		--borderSize: .5rem;
	}

	:global(body),
	:global(html) {
		margin: 0;
		padding: 0;
		font-size: 12px;
		color: var(--backgroundColor);
		background: var(--textColor);
		font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
	}

	:global(*) {
		box-sizing: border-box;
	} 

	:global(*:focus) {
		--shadowSize: calc(.5 * var(--borderSize));
		outline: none;
		box-shadow: 0 var(--shadowSize) 0 var(--highlight);
	} 

	:global(body) {
		display: flex;
		flex-direction: column;
		height: 100vh;
		font-size: 1.5rem;
	}

	header {
		font-size: 1.5rem;
		padding: calc(2 * var(--borderSize));
		border-bottom: var(--borderSize) solid var(--backgroundColor);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	main {
		flex: 1;
		overflow-y: auto;
		padding: calc(2 * var(--borderSize));
		display: flex;
    justify-content: center;
    align-items: center;
		position: relative;
	}

	footer > span {
		display: flex;
		align-items: center;
		padding: 0;
	}
	
	footer > span:before {
		content: '';
		display: block;
		flex: 1;
		height: var(--borderSize);
		background: var(--backgroundColor);
	}

	footer > span > a {
		font-size: .75em;
		font-weight: bold;
		line-height: 1;
		background-color: none;
		color: var(--backgroundColor);
		display: inlnie-block;
		margin: var(--borderSize);
		position: relative;
		top: -2px;
	}

	/* list styles */

	:global(main > p) {
		font-size: 2em;
		text-align: center;
	}

	:global(main ul) {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(30ch, 1fr));
		grid-template-rows: auto;
		gap: calc(2 * var(--borderSize));
    list-style: none;
    padding: 0;
		width: 100%;
		max-width: 100ch;
	}

	:global(main ul li) {
		text-align: center;
  }

	:global(main li span) {
		font-size: 1.5em;
  }

  :global(main li a) {
		display: block;
		color: var(--backgroundColor) !important;
  }

  :global(main li a:hover > span:after) {
    content: ' »';
  }
</style>

<header>
	<Breadcrumbs {owner} {palette} />
	<ActionsButtons />
</header>

<main id='content'>
	<slot></slot>
</main>

<footer>
	{#if !!$actions.current}
		<ActionsArea />
	{/if}
	<span><a href='http://ryanfiller.com'>ryanfiller.com</a></span>
</footer>