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
	import NewUser from '../components/new-user.svelte'
</script>

<svelte:head>
	<title>color-contrast-table</title>
</svelte:head>

<style>
	aside > div {
		margin: 1rem 0;
	}
</style>

<main>
	<ul>
		{#each owners as owner}
			<li>
				<a href="{owner.name}">
					{owner.name}
				</a>
			</li>	
		{/each}
	</ul>
</main>

<aside>
	This is the honor system until I add auth, so please just don't mess with anyone's colors that aren't yours.
	<div>
		<NewUser />
	</div>
</aside>
