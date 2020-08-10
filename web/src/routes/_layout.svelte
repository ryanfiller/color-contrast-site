<script>
	import Breadcrumbs from '../components/breadcrumbs.svelte'
	import ActionsButtons from '../components/actions-buttons.svelte'
	import ActionsArea from '../components/actions-area.svelte'
</script>

<style>
	:root {
		/* these can be changed with action buttons */
		/* --backgroundColor: #212121; */
		/* --textColor: #ffffff; */
		--borderSize: .5rem;
	}

	:global(body),
	:global(html) {
		margin: 0;
		padding: 0;
		font-size: 12px;
		color: var(--backgroundColor);
		background: var(--textColor);
	}

	:global(*) {
		box-sizing: border-box;
	} 

	:global(#sapper) {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	:global(#content) {
		flex: 1;
		padding: calc(2 * var(--borderSize));
		display: flex;
    justify-content: center;
    align-items: center;
	}

	header {
		font-size: 1.5rem;
		padding: calc(2 * var(--borderSize));
		border-bottom: var(--borderSize) solid var(--backgroundColor);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	/* list styles */

	:global(#content ul) {
    list-style: none;
    padding: 0;
  }

  :global(#content li + li) {
    margin-top: 1rem;
  }

	:global(#content span) {
    font-size: 1.5em;
  }

  :global(#content a) {
    text-decoration: none;
    display: block;
  }

  :global(#content a:hover > span:after) {
    content: ' »';
  }
</style>

<header>
	<Breadcrumbs />
	<ActionsButtons />
</header>

<div id='content'>
	<slot></slot>
</div>

<footer>
	<ActionsArea />
</footer>