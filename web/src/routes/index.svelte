<script context="module">
  import client from '../sanityClient'
	export function preload({ params, query }) {
    return client.fetch('*[_type == "owner"]').then(owners => {
			return { owners }
		}).catch(err => this.error(500, err))
	}
</script>

<script>
	export let owners = []
</script>

<style>
	:global(body),
	:global(html) {
		margin: 0;
		padding: 0;
	}

	:global(*) {
		box-sizing: border-box;
	} 
</style>

<svelte:head>
	<title>color-contrast-table</title>
</svelte:head>

<ul>
	{#each owners as owner}
		<li>
			<a href="{owner.name}">
				{owner.name}
			</a>
		</li>	
	{/each}
</ul>
