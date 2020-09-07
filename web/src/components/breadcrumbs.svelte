<script>
	import { url } from '@sveltech/routify'

	export let owner
	export let palette
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

	:global(nav li:last-child a) {
		font-weight: bold;
		color: var(--textColor);
		background: var(--backgroundColor);
		padding: .25em;
	}

	:global(nav a) {
		text-decoration: none;
	}

</style>

<nav>
	<ul>
		<li>
			<a href={$url('/')}>home</a>
		</li>
			{#if owner}
				<li>
					<a href={$url(`/${owner.slug}`)}>{owner.name}</a>
				</li>
			{/if}
			{#if palette}
				<li>
					<a href={$url(`/${owner.slug}/${palette.slug}`)}>{palette.title}</a>
				</li>
			{/if}
	</ul>
</nav>