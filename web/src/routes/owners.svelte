<script>
	import { Navigate } from 'svelte-router-spa'
	import client from '../sanityClient'
	import { actions, activeAction } from '../stores.js'
	import Layout from '../layout.svelte'

	const getOwners = async () => {
		return client.fetch('*[_type == "owner"]').then(response => {
			return response
		}).catch(err => this.error(500, err))
	}

	const owners = getOwners()

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

<Layout>
	{#await owners}
		<p>...waiting</p>
	{:then owners}
		{#if owners && owners.length}
			<ul>
				{#each owners as owner}
					<li>
						<!-- <a href='{owner.name}'> -->
						<Navigate to='{owner.name}'>
							<span>{owner.name}</span>
						<!-- </a> -->
						</Navigate>
					</li>	
				{/each}
			</ul>
		{:else}
			<p>uh oh, there are no users. create one!</p>
		{/if}
	{:catch error}
		error?
	{/await}
</Layout>
