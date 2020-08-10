<script context="module">
  import client from '../sanityClient'
	export function preload({ params, query }) {
    return client().fetch('*[_type == "owner"]').then(owners => {
			return { owners }
		}).catch(err => this.error(500, err))
	}
</script>

<script>
	import { onMount } from 'svelte'
	import { actions } from '../stores.js'
	// import NewUser from '../components/new-user.svelte'

	export let owners = []

	onMount(() => {
		actions.set([
			{
				text: 'add a user',
				icon: 'add',
				action: () => console.log('add a user')
			}
		])
	})
</script>

<svelte:head>
	<title>color-contrast-table</title>
</svelte:head>

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

<!-- <NewUser /> -->
