<script>
	import { stores } from '@sapper/app'
	const { page } = stores()
	// const params = $page.params
	let params

	$: params = $page.params
</script>

<style>
	nav {}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
	}

	li {
		display: inline-block;
		margin-right: 1rem;
	}

	li:not(:last-child):after {
		content: '»';
		margin-left: 1rem;
	}

	li:last-child a {
		font-weight: bold;
		color: var(--textColor);
		background: var(--backgroundColor);
		padding: .25em;
	}

	a {
		text-decoration: none;
	}

</style>

<nav>
	<ul>
		<li><a href='/'>home</a></li>
		{#if params.owner}
			<li><a href={`/${params.owner}`}>{params.owner}</a></li>
		{/if}
		{#if params.palette}
			<li><a href={`/${params.owner}/${params.palette}`}>{params.palette}</a></li>
		{/if}
	</ul>
</nav>