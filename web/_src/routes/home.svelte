<script context="module">
  import client from '../sanityClient'
	export function preload({ params, query }) {
    return client.fetch('*[_type == "owner"]').then(owners => {
			return { owners }
		}).catch(err => this.error(500, err))
	}
</script>

<script>
	import { onMount } from 'svelte'
	import { actions, activeAction } from '../stores.js'

	export let owners = []

	actions.set([
		{
			title: 'addUser',
			text: 'add a user',
			icon: 'add',
			action: () => activeAction.set('addUser')
		}
	])
</script>

<svelte:head>
	<title>color-contrast-table</title>
</svelte:head>


{#if !owners.length}
	<p>uh oh, there are no users. create one!</p>
{:else}
	<ul>
		{#each owners as owner}
			<li>
				<a href='/{owner.name}'>
					<span>{owner.name}</span>
				</a>
			</li>	
		{/each}
	</ul>
{/if}
